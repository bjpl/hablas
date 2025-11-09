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
    # Spanish indicators - check FIRST for definitive Spanish markers
    if re.search(r'[¿¡áéíóúüñ]', text):
        return 'spanish'

    # Common Spanish words (expanded list)
    spanish_words = r'\b(hola|tengo|su|entrega|español|gracias|día|gran|está|estoy|puede|quiere|necesito|disculpe|por favor|buenos|buenas|cómo|dónde|cuál|qué|soy|eres|usted|señor|señora)\b'
    if re.search(spanish_words, text.lower()):
        return 'spanish'

    # English indicators - expanded to catch more phrases
    english_words = r'\b(hello|how|are|you|delivery|order|customer|thank|thanks|please|have|your|great|good|day|hi|morning|evening|night|yes|no|can|could|would|will|my|the|this|that|what|where|when|who|why|sorry|excuse|me)\b'
    if re.search(english_words, text.lower()):
        return 'english'

    # Check for common English patterns
    if re.search(r"(I'm|I am|you're|you are|it's|that's|what's)", text, re.IGNORECASE):
        return 'english'

    # If still unclear, check character distribution
    # English uses more common letters like 'a', 'e', 'i', 'o', 'u' without accents
    # Spanish has different frequency and uses accents
    text_lower = text.lower()

    # Count definitive indicators
    has_articles_the = 'the ' in text_lower or ' the' in text_lower
    has_articles_el = 'el ' in text_lower or ' la ' in text_lower

    if has_articles_the:
        return 'english'
    if has_articles_el:
        return 'spanish'

    # Default to English (safer for mixed/unclear content)
    return 'english'

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

    # Split into lines and FILTER OUT FORMATTING
    all_lines = [line.strip() for line in script_text.split('\n') if line.strip()]

    # STRICT FILTER: Only keep actual spoken content
    lines = []
    i = 0
    while i < len(all_lines):
        line = all_lines[i]

        # Skip ALL non-content lines (but be precise - don't over-match!)
        if (line.startswith('#') or          # Headers
            line.startswith('===') or        # Dividers/Phrase markers (3 or more =)
            line.startswith('━━━') or        # Dividers (3 or more)
            line.startswith('---') or        # Dividers (3 or more -)
            line.startswith('**') or         # Metadata
            line.startswith('(')):           # Parenthetical notes
            i += 1
            continue

        # Skip specific section header lines (exact or near-exact matches)
        line_upper = line.upper().strip()
        if (line_upper.startswith('SECTION ') or
            line_upper == 'CORE CONCEPTS' or
            line_upper == 'MULTI-APP STRATEGY' or
            line_upper == 'EFFICIENCY METRICS' or
            line_upper == 'STRATEGY DISCUSSIONS' or
            line_upper.endswith(' BEST PRACTICES')):
            i += 1
            continue

        # Keep tips/notes as-is
        if line.startswith('['):
            lines.append(line)
            i += 1
            continue

        # For phrase groups after "=== PHRASE N:", there are 2 duplicate lines
        # After filtering empty lines: duplicate, ACTUAL ENGLISH, ACTUAL SPANISH, [Tip]
        # Skip the first (duplicate), keep the next two (English, Spanish)
        if i > 0 and '===' in all_lines[i-1] and 'PHRASE' in all_lines[i-1].upper():
            # This is the duplicate English description - SKIP IT
            i += 1
            # Now at actual English phrase - KEEP IT
            if i < len(all_lines):
                lines.append(all_lines[i])
                i += 1
            # Now at Spanish phrase - KEEP IT
            if i < len(all_lines) and not all_lines[i].startswith('['):
                lines.append(all_lines[i])
                i += 1
            continue

        # UNIVERSAL DUPLICATE DETECTOR: Check if next line is identical
        # This handles resources without "=== PHRASE N:" markers
        # Pattern: English, English (duplicate), Spanish
        if i + 1 < len(all_lines) and line == all_lines[i + 1]:
            # Found duplicate! Skip THIS line, keep the next TWO
            i += 1  # Skip the first duplicate
            if i < len(all_lines):
                lines.append(all_lines[i])  # Keep second English
                i += 1
            if i < len(all_lines) and not all_lines[i].startswith('['):
                lines.append(all_lines[i])  # Keep Spanish
                i += 1
            continue

        # Default: keep the line if it's not empty and not parenthetical
        if line and not line.startswith('('):
            lines.append(line)
        i += 1

    if not lines:
        print(f"   ❌ No content in script after filtering")
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
        # All resources 1-59
        return list(range(1, 60))

    if args.batch:
        # Parse batch format: "1-9" or "11-20"
        parts = args.batch.split('-')
        if len(parts) == 2:
            start, end = int(parts[0]), int(parts[1])
            return list(range(start, end + 1))

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
