#!/usr/bin/env python3
"""
Generate Dual-Voice Audio for Resource 4 - WSL Compatible
Fixed Spanish detection for phrases like "Solo recojo y entrego"
"""

import os
import sys
import tempfile

# Set temp directory to Windows-accessible location
TEMP_DIR = os.path.abspath('temp_audio_working')
os.makedirs(TEMP_DIR, exist_ok=True)
os.environ['TMPDIR'] = TEMP_DIR
os.environ['TEMP'] = TEMP_DIR
os.environ['TMP'] = TEMP_DIR
tempfile.tempdir = TEMP_DIR

# Create wrapper directory for ffmpeg/ffprobe if it doesn't exist
wrapper_dir = os.path.expanduser('~/bin')
os.makedirs(wrapper_dir, exist_ok=True)

# Create ffmpeg wrapper
ffmpeg_wrapper = os.path.join(wrapper_dir, 'ffmpeg')
if not os.path.exists(ffmpeg_wrapper):
    with open(ffmpeg_wrapper, 'w') as f:
        f.write('#!/bin/bash\nexec /mnt/c/ffmpeg/bin/ffmpeg.exe "$@"\n')
    os.chmod(ffmpeg_wrapper, 0o755)

# Create ffprobe wrapper
ffprobe_wrapper = os.path.join(wrapper_dir, 'ffprobe')
if not os.path.exists(ffprobe_wrapper):
    with open(ffprobe_wrapper, 'w') as f:
        f.write('#!/bin/bash\nexec /mnt/c/ffmpeg/bin/ffprobe.exe "$@"\n')
    os.chmod(ffprobe_wrapper, 0o755)

# Add wrapper directory to PATH
os.environ['PATH'] = wrapper_dir + os.pathsep + os.environ.get('PATH', '')

import asyncio
import re
from pathlib import Path
from pydub import AudioSegment
import edge_tts

# Voice configuration for Resource 4
SPANISH_VOICE = 'es-CO-SalomeNeural'  # Colombian female
ENGLISH_VOICE = 'en-US-JennyNeural'    # US female

def detect_language(text: str) -> str:
    """Detect if text is Spanish or English using enhanced word-boundary matching

    FIXED: Added 'solo', 'recojo', 'entrego' and other delivery-specific Spanish words
    """
    # Spanish characters are definitive
    if re.search(r'[¿¡áéíóúüñ]', text):
        return 'spanish'

    # Enhanced Spanish word list with delivery-specific vocabulary
    spanish_words = [
        # Common words
        'hola', 'tengo', 'su', 'entrega', 'español', 'gracias',
        'día', 'gran', 'está', 'estoy', 'puede', 'quiere',
        'necesito', 'disculpe', 'por favor', 'buenos', 'buenas',
        'cómo', 'dónde', 'cuál', 'qué', 'soy', 'eres',
        'usted', 'señor', 'señora',
        # FIXED: Added delivery-specific words
        'solo', 'recojo', 'entrego', 'dejaré', 'puerta', 'edificio',
        'apartamento', 'piso', 'afuera', 'aquí', 'esperaré',
        'minutos', 'bebidas', 'cuidado', 'caliente', 'intenté',
        'llamarte', 'esperando', 'encuentro', 'veo', 'frente',
        'código', 'abrir', 'confirmar', 'teléfono', 'bolsa',
        'dirección', 'ayudarme', 'encontrar', 'salir', 'estacionar',
        'noches', 'comida', 'uber', 'eats', 'todo', 'hay'
    ]

    text_lower = text.lower()
    for word in spanish_words:
        pattern = r'\b' + re.escape(word) + r'\b'
        if re.search(pattern, text_lower):
            return 'spanish'

    # Default to English
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

async def generate_dual_voice_audio():
    """Generate concatenated dual-voice audio for Resource 4"""
    resource_id = 4
    script_path = Path(f'scripts/final-phrases-only/resource-{resource_id}-complete.txt')

    if not script_path.exists():
        print(f"❌ Script not found: {script_path}")
        return False

    # Read script
    with open(script_path, 'r', encoding='utf-8') as f:
        script_text = f.read()

    print(f"\n🎙️  Resource {resource_id}: Frases Esenciales para Entregas")
    print(f"   Script: {script_path.name}")
    print(f"   Spanish: {SPANISH_VOICE}")
    print(f"   English: {ENGLISH_VOICE}")

    # Split into lines and filter
    all_lines = [line.strip() for line in script_text.split('\n') if line.strip()]

    # Filter out non-content lines
    lines = []
    i = 0
    while i < len(all_lines):
        line = all_lines[i]

        # Skip headers, dividers, metadata
        if (line.startswith('#') or
            line.startswith('===') or
            line.startswith('━━━') or
            line.startswith('---') or
            line.startswith('**') or
            line.startswith('(')):
            i += 1
            continue

        # Skip section headers
        line_upper = line.upper().strip()
        if (line_upper.startswith('SECTION ') or
            line_upper.startswith('PHRASE ') or
            line_upper.startswith('TIP:')):
            i += 1
            continue

        # Keep tips/notes
        if line.startswith('['):
            lines.append(line)
            i += 1
            continue

        # Handle duplicate lines (English appears twice)
        if i + 1 < len(all_lines) and line == all_lines[i + 1]:
            # Skip first duplicate
            i += 1
            # Keep second English
            if i < len(all_lines):
                lines.append(all_lines[i])
                i += 1
            # Keep Spanish
            if i < len(all_lines) and not all_lines[i].startswith('['):
                lines.append(all_lines[i])
                i += 1
            continue

        # Keep non-empty lines
        if line and not line.startswith('('):
            lines.append(line)
        i += 1

    if not lines:
        print(f"❌ No content in script after filtering")
        return False

    print(f"   📝 Found {len(lines)} lines to process")

    # Create temp directory
    temp_dir = Path('temp_audio_segments')
    temp_dir.mkdir(exist_ok=True)

    # Process each line into audio segments
    segments = []
    segment_count = 0
    spanish_count = 0
    english_count = 0

    for i, line in enumerate(lines):
        # Detect language
        lang = detect_language(line)

        # Track counts
        if lang == 'spanish':
            spanish_count += 1
        else:
            english_count += 1

        # Get appropriate voice
        voice = SPANISH_VOICE if lang == 'spanish' else ENGLISH_VOICE

        # Generate this segment
        temp_file = temp_dir / f'segment_{segment_count:03d}.mp3'

        lang_tag = 'ES' if lang == 'spanish' else 'EN'
        print(f"   [{i+1}/{len(lines)}] [{lang_tag}]: {line[:60]}...")

        if await generate_segment(line, voice, str(temp_file)):
            try:
                # Load the audio segment using Windows ffmpeg
                audio = AudioSegment.from_mp3(str(temp_file))
                segments.append(audio)
            except Exception as e:
                print(f"   ⚠️  Error loading segment: {e}")
                continue

            # Add pause after each line
            if lang == 'english':
                segments.append(AudioSegment.silent(duration=1000))  # 1 second
            else:
                segments.append(AudioSegment.silent(duration=500))   # 0.5 seconds

            segment_count += 1

        await asyncio.sleep(0.5)  # Rate limiting

    if not segments:
        print(f"❌ No segments generated")
        return False

    print(f"\n   📊 Language distribution:")
    print(f"      English: {english_count} segments")
    print(f"      Spanish: {spanish_count} segments")

    # Concatenate all segments
    print(f"\n   🔄 Concatenating {len(segments)} segments...")
    final_audio = segments[0]
    for segment in segments[1:]:
        final_audio += segment

    # Export - use Windows-accessible temp directory
    output_file = f'public/audio/resource-{resource_id}.mp3'
    print(f"   💾 Exporting to {output_file}...")

    # Save as WAV first (no encoding issues)
    temp_wav = f'temp_resource_{resource_id}.wav'
    final_audio.export(temp_wav, format='wav')

    # Convert to MP3 using ffmpeg directly (with proper path handling)
    import subprocess
    subprocess.run([
        'ffmpeg', '-y', '-i', temp_wav,
        '-b:a', '128k',
        '-f', 'mp3',
        output_file
    ], check=True)

    # Cleanup WAV
    import shutil
    if os.path.exists(temp_wav):
        os.remove(temp_wav)

    file_size = os.path.getsize(output_file) / (1024 * 1024)
    duration = len(final_audio) / 1000  # Convert ms to seconds

    print(f"   ✅ COMPLETE!")
    print(f"   📊 File size: {file_size:.1f} MB")
    print(f"   ⏱️  Duration: {duration:.1f} seconds ({duration/60:.1f} minutes)")

    # Cleanup temp files
    import shutil
    shutil.rmtree(temp_dir, ignore_errors=True)

    return True

async def main():
    print("🎙️  Dual-Voice Audio Generation for Resource 4")
    print("   Fixed: Enhanced Spanish word detection for delivery phrases")
    print("=" * 70)

    try:
        success = await generate_dual_voice_audio()
        if success:
            print("\n✅ Audio generation complete!")
            print("📁 Location: public/audio/resource-4.mp3")
            print("\n🔍 Test the phrase 'Solo recojo y entrego' - should use Spanish voice")
        else:
            print("\n❌ Audio generation failed!")
            return 1
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == '__main__':
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
