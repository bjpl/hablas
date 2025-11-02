#!/usr/bin/env python3
"""
Generate Dual-Voice Audio for ALL Resources
Adapted to work with phrase-only scripts in final-phrases-only/

USAGE:
    python scripts/generate-all-audio.py --resources 1,3,4,5,6,8,9
    python scripts/generate-all-audio.py --batch 1-9
    python scripts/generate-all-audio.py --all
"""

import os
import sys
import argparse

# Add ffmpeg to PATH BEFORE importing pydub
os.environ['PATH'] = r'C:\ffmpeg\bin' + os.pathsep + os.environ.get('PATH', '')

import asyncio
import re
from pathlib import Path
from pydub import AudioSegment
import edge_tts

# Voice configuration - assign voices based on resource ID patterns
def get_voices_for_resource(resource_id: int) -> tuple:
    """Assign appropriate Spanish/English voices based on resource ID"""
    # Resources with existing audio (use their original voices)
    known_voices = {
        2: ('es-CO-SalomeNeural', 'en-US-JennyNeural'),
        7: ('es-CO-GonzaloNeural', 'en-US-GuyNeural'),
        10: ('es-MX-DaliaNeural', 'en-US-JennyNeural'),
        13: ('es-CO-SalomeNeural', 'en-US-GuyNeural'),
        18: ('es-MX-DaliaNeural', 'en-US-JennyNeural'),
        21: ('es-CO-SalomeNeural', 'en-US-JennyNeural'),
        28: ('es-CO-GonzaloNeural', 'en-US-GuyNeural'),
        32: ('es-MX-DaliaNeural', 'en-US-JennyNeural'),
        34: ('es-CO-GonzaloNeural', 'en-US-GuyNeural'),
    }

    if resource_id in known_voices:
        return known_voices[resource_id]

    # Alternate between female/male and Colombian/Mexican for variety
    # Female resources: 1,3,5,11,15,19,23,27,31,35...
    # Male resources: 4,6,8,12,16,20,24,29,33,36...
    is_female = (resource_id % 4) in [1, 3]
    use_mexican = (resource_id % 3) == 0

    if is_female:
        spanish = 'es-MX-DaliaNeural' if use_mexican else 'es-CO-SalomeNeural'
        english = 'en-US-JennyNeural'
    else:
        spanish = 'es-MX-JorgeNeural' if use_mexican else 'es-CO-GonzaloNeural'
        english = 'en-US-GuyNeural'

    return (spanish, english)

def detect_language(text: str) -> str:
    """Detect if text is Spanish or English"""
    # Spanish indicators
    if re.search(r'[¿¡áéíóúüñ]', text):
        return 'spanish'
    if re.search(r'\b(hola|tengo|su|entrega|español|gracias|día|gran)\b', text.lower()):
        return 'spanish'
    # English indicators
    if re.search(r'\b(delivery|order|customer|thank|please|have|your|great|day|hi)\b', text.lower()):
        return 'english'
    # Default to Spanish
    return 'spanish'

async def generate_segment(text: str, voice: str, temp_file: str) -> bool:
    """Generate audio for one text segment"""
    try:
        communicate = edge_tts.Communicate(text=text, voice=voice, rate="-20%")
        await communicate.save(temp_file)
        return True
    except Exception as e:
        print(f"   ⚠️  Error generating segment: {e}")
        return False

async def generate_dual_voice_audio(resource_id: int):
    """
    Generate concatenated dual-voice audio from phrase-only script

    Args:
        resource_id: Resource ID (1-59)
    """
    # Determine script path
    script_path = Path(f'scripts/final-phrases-only/resource-{resource_id}.txt')

    if not script_path.exists():
        print(f"   ❌ Script not found: {script_path}")
        return False

    # Read script
    with open(script_path, 'r', encoding='utf-8') as f:
        script_text = f.read()

    # Get voices for this resource
    spanish_voice, english_voice = get_voices_for_resource(resource_id)

    print(f"\n🎙️  Resource {resource_id}")
    print(f"   Script: {script_path.name}")
    print(f"   Spanish: {spanish_voice}")
    print(f"   English: {english_voice}")

    # Split into lines
    lines = [line.strip() for line in script_text.split('\n') if line.strip()]

    if not lines:
        print(f"   ❌ No content in script")
        return False

    # Create temp directory
    temp_dir = Path('temp_audio_segments')
    temp_dir.mkdir(exist_ok=True)

    # Process each line into audio segments
    segments = []
    segment_count = 0

    for i, line in enumerate(lines):
        # Detect language
        lang = detect_language(line)

        # Get appropriate voice
        voice = spanish_voice if lang == 'spanish' else english_voice

        # Generate this segment
        temp_file = temp_dir / f'segment_{segment_count:03d}.mp3'

        print(f"   [{i+1}/{len(lines)}] {lang[:2].upper()}: {line[:50]}...")

        if await generate_segment(line, voice, str(temp_file)):
            try:
                # Load the audio segment
                audio = AudioSegment.from_mp3(str(temp_file))
                segments.append(audio)
            except Exception as e:
                print(f"   ⚠️  Error loading segment: {e}")
                continue

            # Add pause after each line
            if lang == 'english':
                # Longer pause after English (1 second)
                segments.append(AudioSegment.silent(duration=1000))
            else:
                # Shorter pause after Spanish (500ms)
                segments.append(AudioSegment.silent(duration=500))

            segment_count += 1

        await asyncio.sleep(0.5)  # Rate limiting

    if not segments:
        print(f"   ❌ No segments generated")
        return False

    # Concatenate all segments
    print(f"\n   🔄 Concatenating {len(segments)} segments...")
    final_audio = segments[0]
    for segment in segments[1:]:
        final_audio += segment

    # Export
    output_file = f'public/audio/resource-{resource_id}.mp3'
    print(f"   💾 Exporting to {output_file}...")
    final_audio.export(output_file, format='mp3', bitrate='128k')

    file_size = os.path.getsize(output_file) / (1024 * 1024)
    print(f"   ✅ COMPLETE: {file_size:.1f} MB")

    # Cleanup temp files
    import shutil
    shutil.rmtree(temp_dir, ignore_errors=True)

    return True

def parse_resource_list(args) -> list:
    """Parse command line arguments into list of resource IDs"""
    if args.all:
        # All resources 1-59 except those with existing audio
        existing = [2, 7, 10, 13, 18, 21, 28, 32, 34]
        return [i for i in range(1, 60) if i not in existing]

    if args.batch:
        # Parse batch format: "1-9" or "11-20"
        parts = args.batch.split('-')
        if len(parts) == 2:
            start, end = int(parts[0]), int(parts[1])
            existing = [2, 7, 10, 13, 18, 21, 28, 32, 34]
            return [i for i in range(start, end + 1) if i not in existing]

    if args.resources:
        # Parse comma-separated list: "1,3,4,5"
        return [int(r.strip()) for r in args.resources.split(',')]

    return []

async def main():
    parser = argparse.ArgumentParser(description='Generate dual-voice audio for resources')
    parser.add_argument('--resources', help='Comma-separated resource IDs (e.g., 1,3,4,5)')
    parser.add_argument('--batch', help='Range of resources (e.g., 1-9)')
    parser.add_argument('--all', action='store_true', help='Generate all missing audio files')

    args = parser.parse_args()

    resource_ids = parse_resource_list(args)

    if not resource_ids:
        print("❌ No resources specified!")
        print("\nUsage:")
        print("  python scripts/generate-all-audio.py --resources 1,3,4,5")
        print("  python scripts/generate-all-audio.py --batch 1-9")
        print("  python scripts/generate-all-audio.py --all")
        return

    print("🎙️  Dual-Voice Audio Generation")
    print("=" * 70)
    print(f"📊 Generating {len(resource_ids)} resources: {resource_ids}")
    print("=" * 70 + "\n")

    success_count = 0
    failed = []

    for resource_id in resource_ids:
        try:
            if await generate_dual_voice_audio(resource_id):
                success_count += 1
            else:
                failed.append(resource_id)
        except Exception as e:
            print(f"\n❌ Error processing resource {resource_id}: {e}")
            failed.append(resource_id)

        await asyncio.sleep(2)  # Pause between resources

    print("\n" + "=" * 70)
    print(f"✅ Success: {success_count}/{len(resource_ids)} files generated")

    if failed:
        print(f"❌ Failed: {failed}")

    print(f"\n📁 Location: public/audio/")
    print("🎉 Batch complete!")

if __name__ == '__main__':
    asyncio.run(main())
