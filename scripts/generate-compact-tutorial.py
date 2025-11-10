#!/usr/bin/env python3
"""
Generate Compact Tutorial Audio from tutorial-scripts

USAGE:
    python scripts/generate-compact-tutorial.py resource-1-compact.txt
"""

import os
import sys
import asyncio
import re
from pathlib import Path

# Add ffmpeg to PATH BEFORE importing pydub - use Windows path from WSL
ffmpeg_path = '/mnt/c/ffmpeg/bin'
if os.path.exists(ffmpeg_path):
    os.environ['PATH'] = ffmpeg_path + os.pathsep + os.environ.get('PATH', '')

from pydub import AudioSegment
import edge_tts

# Voice configuration
SPANISH_VOICE = 'es-CO-SalomeNeural'  # Female Colombian narrator
ENGLISH_VOICE = 'en-US-JennyNeural'   # Female US voice for English phrases

def parse_compact_script(filepath: Path) -> list:
    """Parse compact tutorial script into audio segments"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    segments = []

    # Split by sections
    sections = content.split('---')

    for section in sections:
        lines = [line.strip() for line in section.strip().split('\n') if line.strip()]

        for line in lines:
            # Skip section headers (e.g., "INTRODUCTION (30 seconds):")
            if line.endswith(':') and '(' in line:
                continue

            # Detect language
            if re.search(r'[¿¡áéíóúüñ]', line) or any(word in line.lower() for word in ['hola', 'tengo', 'tu', 'para', 'español', 'buen', 'día']):
                # Spanish text - use narrator voice with normal speed
                segments.append({
                    'text': line,
                    'voice': SPANISH_VOICE,
                    'rate': '+0%',  # Normal speed for Spanish
                    'pause_after': 0.5
                })
            else:
                # English phrase - slower for learning
                segments.append({
                    'text': line,
                    'voice': ENGLISH_VOICE,
                    'rate': '-20%',  # Slower for learning
                    'pause_after': 1.0  # Longer pause after English
                })

    return segments

async def generate_audio_segment(text: str, voice: str, rate: str, temp_file: str) -> bool:
    """Generate audio for one segment"""
    try:
        communicate = edge_tts.Communicate(text=text, voice=voice, rate=rate)
        await communicate.save(temp_file)
        return True
    except Exception as e:
        print(f"❌ Error generating segment: {e}")
        return False

async def generate_tutorial_audio(script_file: str, output_file: str):
    """Generate complete tutorial audio"""

    script_path = Path(script_file)
    if not script_path.exists():
        print(f"❌ Script file not found: {script_file}")
        return False

    print(f"📝 Parsing script: {script_path.name}")
    segments = parse_compact_script(script_path)
    print(f"✅ Found {len(segments)} audio segments")

    # Generate audio segments
    final_audio = AudioSegment.empty()
    temp_dir = Path('temp_audio')
    temp_dir.mkdir(exist_ok=True)

    for i, segment in enumerate(segments, 1):
        print(f"🎙️  Generating segment {i}/{len(segments)}: {segment['text'][:50]}...")

        temp_file = temp_dir / f"segment_{i}.mp3"
        success = await generate_audio_segment(
            text=segment['text'],
            voice=segment['voice'],
            rate=segment['rate'],
            temp_file=str(temp_file)
        )

        if success and temp_file.exists():
            try:
                # Load and append audio
                audio = AudioSegment.from_file(str(temp_file), format='mp3')
                final_audio += audio

                # Add pause
                pause = AudioSegment.silent(duration=int(segment['pause_after'] * 1000))
                final_audio += pause
            except Exception as e:
                print(f"⚠️  Error loading segment {i}: {e}")

            # Clean up temp file
            try:
                temp_file.unlink()
            except:
                pass
        else:
            print(f"⚠️  Skipping segment {i}")

    # Clean up temp directory
    if temp_dir.exists() and not list(temp_dir.iterdir()):
        temp_dir.rmdir()

    # Export final audio
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"💾 Exporting to: {output_file}")
    final_audio.export(output_file, format='mp3', bitrate='128k')

    # Get duration and file size
    duration_seconds = len(final_audio) / 1000
    duration_minutes = duration_seconds / 60
    file_size_mb = output_path.stat().st_size / (1024 * 1024)

    print(f"\n✅ AUDIO GENERATION COMPLETE!")
    print(f"📊 Duration: {duration_minutes:.1f} minutes ({duration_seconds:.0f} seconds)")
    print(f"💾 File size: {file_size_mb:.1f} MB")
    print(f"📁 Output: {output_file}")

    # Quality check
    if duration_minutes < 12 or duration_minutes > 15:
        print(f"⚠️  WARNING: Duration outside target range (12-15 minutes)")
    if file_size_mb < 5 or file_size_mb > 7:
        print(f"⚠️  WARNING: File size outside target range (5-7 MB)")

    return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python generate-compact-tutorial.py <script-file> [output-file]")
        print("Example: python generate-compact-tutorial.py tutorial-scripts/resource-1-compact.txt public/audio/resource-1.mp3")
        sys.exit(1)

    script_file = sys.argv[1]

    # Determine output file
    if len(sys.argv) >= 3:
        output_file = sys.argv[2]
    else:
        # Auto-generate output filename
        script_name = Path(script_file).stem  # e.g., "resource-1-compact"
        resource_id = script_name.split('-')[1]  # Extract "1"
        output_file = f"public/audio/resource-{resource_id}.mp3"

    # Run async generation
    asyncio.run(generate_tutorial_audio(script_file, output_file))

if __name__ == '__main__':
    main()
