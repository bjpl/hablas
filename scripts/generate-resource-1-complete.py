#!/usr/bin/env python3
"""
Generate Complete Audio for Resource 1
Simple line-by-line processing - no complex filtering needed
"""

import os
import sys
import asyncio
import subprocess
from pathlib import Path
import edge_tts

# Add ffmpeg to PATH - Windows WSL can access Windows paths
ffmpeg_paths = [
    r'C:\ffmpeg\bin',
    '/mnt/c/ffmpeg/bin',
    '/mnt/c/Program Files/ffmpeg/bin',
]
for ffmpeg_path in ffmpeg_paths:
    if os.path.exists(ffmpeg_path):
        os.environ['PATH'] = ffmpeg_path + os.pathsep + os.environ.get('PATH', '')
        break

# Voice configuration for resource 1
SPANISH_VOICE = 'es-CO-SalomeNeural'  # Female Colombian
ENGLISH_VOICE = 'en-US-JennyNeural'   # Female US

def is_spanish(text: str) -> bool:
    """Detect Spanish using character markers and whole-word matching"""
    import re

    # Spanish characters are definitive
    spanish_chars = 'áéíóúñ¿¡'
    if any(char in text for char in spanish_chars):
        return True

    # Use word boundaries to match complete words only
    spanish_words = [
        'hola', 'tengo', 'entrega', 'español', 'gracias',
        'buenos', 'soy', 'para', 'con', 'una',
        'día', 'días', 'tu', 'tus', 'que', 'qué',
        'mi', 'mis', 'lo', 'los', 'las'
    ]

    text_lower = text.lower()

    for word in spanish_words:
        # Match whole words only using word boundaries
        pattern = r'\b' + re.escape(word) + r'\b'
        if re.search(pattern, text_lower):
            return True

    return False

async def generate_audio_segment(text: str, voice: str, output_path: str) -> bool:
    """Generate audio for one text segment"""
    try:
        communicate = edge_tts.Communicate(text=text, voice=voice, rate="-20%")
        await communicate.save(output_path)
        return True
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        return False

async def main():
    print("🎙️  Generating Complete Audio for Resource 1")
    print("=" * 70)

    # Read the compact script
    script_path = Path('scripts/tutorial-scripts/resource-1-compact.txt')
    with open(script_path, 'r', encoding='utf-8') as f:
        all_lines = [line.strip() for line in f.readlines() if line.strip()]

    print(f"📄 Total lines in script: {len(all_lines)}")

    # Create temp directory
    temp_dir = Path('temp_audio_segments')
    temp_dir.mkdir(exist_ok=True)

    segment_files = []
    segment_num = 0

    # Process EVERY non-empty line
    for i, line in enumerate(all_lines, 1):
        # Skip obvious formatting lines
        if (line.startswith('---') or
            line.startswith('===') or
            line.startswith('PHRASE ') or
            line.startswith('INTRODUCTION') or
            line.startswith('PRACTICE SECTION') or
            line.startswith('CONCLUSION')):
            print(f"   [{i}/{len(all_lines)}] SKIP: {line[:50]}")
            continue

        # Detect language
        lang = 'spanish' if is_spanish(line) else 'english'
        voice = SPANISH_VOICE if lang == 'spanish' else ENGLISH_VOICE

        # Generate audio
        temp_file = temp_dir / f'seg_{segment_num:04d}.mp3'

        print(f"   [{i}/{len(all_lines)}] {lang[:2].upper()}: {line[:60]}")

        if await generate_audio_segment(line, voice, str(temp_file)):
            # Just keep track of the file path
            segment_files.append(str(temp_file))
            segment_num += 1

        # Rate limiting
        await asyncio.sleep(0.3)

    if not segment_files:
        print("\n❌ No segments generated!")
        return

    print(f"\n🔄 Concatenating {len(segment_files)} segments using ffmpeg...")

    # Create concat list for ffmpeg
    concat_file = temp_dir / 'concat_list.txt'
    with open(concat_file, 'w') as f:
        for seg_file in segment_files:
            # Convert WSL path to Windows path for ffmpeg
            abs_path = os.path.abspath(seg_file)
            if abs_path.startswith('/mnt/c/'):
                win_path = 'C:' + abs_path[6:].replace('/', '\\')
            else:
                win_path = abs_path
            f.write(f"file '{win_path}'\n")

    # Use ffmpeg to concatenate
    output_file = 'public/audio/resource-1.mp3'

    # Determine ffmpeg executable (Windows needs .exe)
    ffmpeg_exe = 'ffmpeg.exe' if os.path.exists('/mnt/c/ffmpeg/bin/ffmpeg.exe') else 'ffmpeg'
    ffprobe_exe = 'ffprobe.exe' if os.path.exists('/mnt/c/ffmpeg/bin/ffprobe.exe') else 'ffprobe'

    # Convert concat file path to Windows format
    concat_file_abs = os.path.abspath(str(concat_file))
    if concat_file_abs.startswith('/mnt/c/'):
        concat_file_win = 'C:' + concat_file_abs[6:].replace('/', '\\')
    else:
        concat_file_win = concat_file_abs

    # Convert output file to Windows format
    output_file_abs = os.path.abspath(output_file)
    if output_file_abs.startswith('/mnt/c/'):
        output_file_win = 'C:' + output_file_abs[6:].replace('/', '\\')
    else:
        output_file_win = output_file_abs

    # Try ffmpeg concatenation
    ffmpeg_cmd = [
        ffmpeg_exe, '-y', '-f', 'concat', '-safe', '0',
        '-i', concat_file_win,
        '-c', 'copy',
        output_file_win
    ]

    try:
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"⚠️  ffmpeg concat failed, trying alternative method...")
            # Fall back to re-encoding method
            ffmpeg_cmd = [
                ffmpeg_exe, '-y', '-f', 'concat', '-safe', '0',
                '-i', concat_file_win,
                '-acodec', 'libmp3lame', '-b:a', '128k',
                output_file_win
            ]
            subprocess.run(ffmpeg_cmd, check=True)
    except Exception as e:
        print(f"❌ ffmpeg failed: {e}")
        return

    # Stats
    if os.path.exists(output_file):
        file_size = os.path.getsize(output_file) / (1024 * 1024)

        # Get duration using ffprobe if available
        try:
            duration_cmd = [ffprobe_exe, '-v', 'error', '-show_entries',
                          'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1',
                          str(output_file)]
            duration_result = subprocess.run(duration_cmd, capture_output=True, text=True)
            duration = float(duration_result.stdout.strip()) / 60
        except:
            duration = 0

        print(f"\n✅ COMPLETE!")
        print(f"   File: {output_file}")
        print(f"   Size: {file_size:.1f} MB")
        if duration > 0:
            print(f"   Duration: {duration:.1f} minutes")
        print(f"   Segments: {segment_num}")
    else:
        print(f"\n❌ Output file not created!")

    # Cleanup
    import shutil
    shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == '__main__':
    asyncio.run(main())
