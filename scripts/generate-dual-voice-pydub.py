#!/usr/bin/env python3
"""
Generate Dual-Voice Audio with pydub Concatenation

SYSTEMATIC APPROACH:
1. Parse cleaned script into segments
2. Detect language of each segment
3. Generate audio for each segment with appropriate voice
4. Concatenate with natural pauses
5. Export single MP3 file

Result: Native pronunciation for both languages!
"""

import asyncio
import os
import re
from pathlib import Path
from pydub import AudioSegment
import edge_tts

# Set ffmpeg paths (BlueStacks includes ffmpeg)
ffmpeg_path = r"C:\Program Files\BlueStacks_nxt\ffmpeg.exe"
AudioSegment.converter = ffmpeg_path
AudioSegment.ffmpeg = ffmpeg_path
AudioSegment.ffprobe = ffmpeg_path  # Use ffmpeg for both (it includes ffprobe functionality)

# Voice configuration
VOICES = {
    'spanish': {
        2: 'es-CO-SalomeNeural',  # Colombian female
        7: 'es-CO-GonzaloNeural',  # Colombian male
        10: 'es-MX-DaliaNeural',   # Mexican female
        13: 'es-CO-SalomeNeural',
        18: 'es-MX-DaliaNeural',
        21: 'es-CO-SalomeNeural',
        28: 'es-CO-GonzaloNeural',
        32: 'es-MX-DaliaNeural',
        34: 'es-CO-GonzaloNeural',
    },
    'english': {
        2: 'en-US-JennyNeural',  # American female
        7: 'en-US-GuyNeural',     # American male
        10: 'en-US-JennyNeural',
        13: 'en-US-GuyNeural',
        18: 'en-US-JennyNeural',
        21: 'en-US-JennyNeural',
        28: 'en-US-GuyNeural',
        32: 'en-US-JennyNeural',
        34: 'en-US-GuyNeural',
    }
}

def detect_language(text: str) -> str:
    """Detect if text is Spanish or English"""
    # Spanish indicators
    if re.search(r'[¿¡áéíóúüñ]', text):
        return 'spanish'
    if re.search(r'\b(hola|tengo|su|entrega|español|frase|número|cliente)\b', text.lower()):
        return 'spanish'
    # English indicators
    if re.search(r'\b(delivery|order|customer|michael|thank|please|have|your)\b', text.lower()):
        return 'english'
    # Default to Spanish (narrator context)
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

async def generate_dual_voice_audio(resource_id: int, test_mode=False):
    """
    Generate concatenated dual-voice audio

    Args:
        resource_id: Resource ID (2, 7, 10, etc.)
        test_mode: If True, only generate first 3 phrases for testing
    """
    # Map resource ID to script file
    script_mapping = {
        2: 'basic_audio_1-audio-script.txt',
        7: 'basic_audio_2-audio-script.txt',
        10: 'intermediate_conversations_1-audio-script.txt',
        13: 'basic_audio_navigation_1-audio-script.txt',
        18: 'basic_audio_navigation_2-audio-script.txt',
        21: 'basic_greetings_all_1-audio-script.txt',
        28: 'basic_greetings_all_2-audio-script.txt',
        32: 'intermediate_conversations_2-audio-script.txt',
        34: 'intermediate_audio_conversations_1-audio-script.txt',
    }

    script_file = script_mapping.get(resource_id)
    if not script_file:
        print(f"⚠️  Resource {resource_id}: No script mapping")
        return False

    script_path = Path(f'scripts/cleaned-audio-scripts/{script_file}')
    if not script_path.exists():
        print(f"⚠️  Script not found: {script_path}")
        return False

    print(f"\n🎙️  Resource {resource_id}: {script_file}")
    print(f"   Spanish Voice: {VOICES['spanish'][resource_id]}")
    print(f"   English Voice: {VOICES['english'][resource_id]}")

    # Read cleaned script
    with open(script_path, 'r', encoding='utf-8') as f:
        script_text = f.read()

    # Split into lines
    lines = [line.strip() for line in script_text.split('\n') if line.strip()]

    # Limit for test mode
    if test_mode:
        lines = lines[:15]  # First ~3 phrases
        print(f"   TEST MODE: Processing first 15 lines only")

    # Create temp directory
    temp_dir = Path('temp_audio_segments')
    temp_dir.mkdir(exist_ok=True)

    # Process each line into audio segments
    segments = []
    segment_count = 0

    for i, line in enumerate(lines):
        # Detect language
        lang = detect_language(line)
        voice = VOICES[lang][resource_id]

        # Generate this segment
        temp_file = temp_dir / f'segment_{segment_count:03d}.mp3'

        print(f"   [{i+1}/{len(lines)}] {lang[:2].upper()}: {line[:50]}...")

        if await generate_segment(line, voice, str(temp_file)):
            # Load the audio segment
            audio = AudioSegment.from_mp3(str(temp_file))
            segments.append(audio)

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
    if test_mode:
        output_file = f'public/audio/resource-{resource_id}-TEST.mp3'

    print(f"   💾 Exporting to {output_file}...")
    final_audio.export(output_file, format='mp3', bitrate='128k')

    file_size = os.path.getsize(output_file) / (1024 * 1024)
    print(f"   ✅ COMPLETE: {file_size:.1f} MB")

    # Cleanup temp files
    import shutil
    shutil.rmtree(temp_dir, ignore_errors=True)

    return True

async def main():
    import sys

    print("🎙️  Dual-Voice Audio Generation (pydub Concatenation)")
    print("=" * 70)
    print("Spanish segments → Colombian/Mexican voices")
    print("English segments → American English voices")
    print("Result: NATIVE pronunciation for both!")
    print("=" * 70 + "\n")

    # Check for test mode
    test_mode = '--test' in sys.argv
    resource_ids = [2] if test_mode else [2, 7, 10, 13, 18, 21, 28, 32, 34]

    if test_mode:
        print("🧪 TEST MODE: Generating resource-2 only (first 3 phrases)")
        print("=" * 70 + "\n")

    success_count = 0
    for resource_id in resource_ids:
        if await generate_dual_voice_audio(resource_id, test_mode=test_mode):
            success_count += 1

    print("\n" + "=" * 70)
    print(f"✅ Success: {success_count}/{len(resource_ids)} files generated")

    if test_mode:
        print("\n🎧 TEST FILE: public/audio/resource-2-TEST.mp3")
        print("   Listen to verify quality before generating all")
        print("\n   If good, run: python scripts/generate-dual-voice-pydub.py")
    else:
        print(f"\n📁 Location: public/audio/")
        print("🎉 Ready to deploy!")

if __name__ == '__main__':
    asyncio.run(main())
