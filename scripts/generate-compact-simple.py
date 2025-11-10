#!/usr/bin/env python3
"""
Generate Compact Tutorial Audio - Simplified Version
Uses edge-tts only, concatenates MP3 files without re-encoding
"""

import os
import sys
import asyncio
import re
from pathlib import Path

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
                })
            else:
                # English phrase - slower for learning
                segments.append({
                    'text': line,
                    'voice': ENGLISH_VOICE,
                    'rate': '-20%',  # Slower for learning
                })

    return segments

async def generate_audio_segment(text: str, voice: str, rate: str, output_file: str) -> bool:
    """Generate audio for one segment"""
    try:
        communicate = edge_tts.Communicate(text=text, voice=voice, rate=rate)
        await communicate.save(output_file)
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

    # Create temp directory for segments
    temp_dir = Path('temp_audio_segments')
    temp_dir.mkdir(exist_ok=True)

    # Generate all audio segments
    segment_files = []

    for i, segment in enumerate(segments, 1):
        print(f"🎙️  [{i}/{len(segments)}] {segment['text'][:60]}...")

        temp_file = temp_dir / f"seg_{i:04d}.mp3"
        success = await generate_audio_segment(
            text=segment['text'],
            voice=segment['voice'],
            rate=segment['rate'],
            output_file=str(temp_file)
        )

        if success and temp_file.exists():
            segment_files.append(temp_file)

    print(f"\n✅ Generated {len(segment_files)}/{len(segments)} segments")

    # Concatenate MP3 files using binary concatenation
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"💾 Concatenating {len(segment_files)} segments...")

    with open(output_path, 'wb') as outfile:
        for seg_file in segment_files:
            with open(seg_file, 'rb') as infile:
                outfile.write(infile.read())

    # Clean up temp files
    print("🧹 Cleaning up temporary files...")
    for seg_file in segment_files:
        try:
            seg_file.unlink()
        except:
            pass

    if temp_dir.exists() and not list(temp_dir.iterdir()):
        temp_dir.rmdir()

    # Get file size
    file_size_mb = output_path.stat().st_size / (1024 * 1024)

    print(f"\n✅ AUDIO GENERATION COMPLETE!")
    print(f"💾 File size: {file_size_mb:.1f} MB")
    print(f"📁 Output: {output_file}")
    print(f"📊 Segments: {len(segment_files)}")

    return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python generate-compact-simple.py <script-file> [output-file]")
        print("Example: python generate-compact-simple.py tutorial-scripts/resource-1-compact.txt public/audio/resource-1.mp3")
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
