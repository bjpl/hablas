#!/usr/bin/env python3
"""
Generate Tutorial Audio for Resource #1
Uses the full tutorial script with narrator segments
"""

import os
import sys

# Add ffmpeg to PATH BEFORE importing pydub
os.environ['PATH'] = r'C:\ffmpeg\bin' + os.pathsep + os.environ.get('PATH', '')

import asyncio
import re
from pathlib import Path
from pydub import AudioSegment
import edge_tts

# Voice configuration for Resource #1 tutorial
SPANISH_NARRATOR = 'es-CO-SalomeNeural'  # Warm, professional female narrator
ENGLISH_VOICE = 'en-US-JennyNeural'

def detect_language(text: str) -> str:
    """Detect if text is Spanish or English using word-boundary matching"""
    # Spanish characters are definitive
    if re.search(r'[¿¡áéíóúüñ]', text):
        return 'spanish'

    # Use word boundaries to match complete words only
    spanish_words = [
        'hola', 'tengo', 'su', 'entrega', 'español', 'gracias',
        'día', 'gran', 'está', 'estoy', 'puede', 'quiere',
        'necesito', 'disculpe', 'por favor', 'buenos', 'buenas',
        'cómo', 'dónde', 'cuál', 'qué', 'soy', 'eres',
        'usted', 'señor', 'señora', 'instructor', 'repartidor',
        'escucharás', 'aprender', 'frases', 'cliente', 'pedido',
        'trabajo', 'profesional', 'usar', 'práctica', 'minutos',
        'veces', 'lentamente', 'claridad', 'traducción', 'consejo',
        'recomendación'
    ]

    text_lower = text.lower()
    for word in spanish_words:
        pattern = r'\b' + re.escape(word) + r'\b'
        if re.search(pattern, text_lower):
            return 'spanish'

    # English indicators
    english_words = r'\b(hello|how|are|you|delivery|order|customer|thank|thanks|please|have|your|great|good|day|hi|morning|evening|driver|here|outside|gate|house|street|meet|lobby|meal|enjoy|take care)\b'
    if re.search(english_words, text.lower()):
        return 'english'

    # Default to Spanish for narrator segments
    return 'spanish'

async def generate_segment(text: str, voice: str, temp_file: str, rate: str = "-20%") -> bool:
    """Generate audio for one text segment"""
    try:
        communicate = edge_tts.Communicate(text=text, voice=voice, rate=rate)
        await communicate.save(temp_file)
        return True
    except Exception as e:
        print(f"   ⚠️  Error generating segment: {e}")
        return False

async def generate_tutorial_audio():
    """Generate tutorial audio from full tutorial script"""

    script_path = Path('scripts/tutorial-scripts/resource-1-tutorial.txt')

    if not script_path.exists():
        print(f"   ❌ Tutorial script not found: {script_path}")
        return False

    # Read script
    with open(script_path, 'r', encoding='utf-8') as f:
        script_text = f.read()

    print(f"\n🎙️  Resource #1 Tutorial Audio Generation")
    print(f"   Script: {script_path.name}")
    print(f"   Spanish Narrator: {SPANISH_NARRATOR}")
    print(f"   English Voice: {ENGLISH_VOICE}")
    print("=" * 70)

    # Split into lines and filter
    all_lines = [line.strip() for line in script_text.split('\n') if line.strip()]

    # Filter out metadata and formatting
    lines = []
    for line in all_lines:
        # Skip section markers, timestamps, metadata
        if (line.startswith('===') or
            line.startswith('[SECTION') or
            line.startswith('[PHRASE') or
            line.startswith('[END OF') or
            line.startswith('Timestamp:') or
            line.startswith('Duration:') or
            line.startswith('Speaker:') or
            line.startswith('Language:') or
            line.startswith('Tone:') or
            line.startswith('Pace:') or
            line.startswith('Total estimated') or
            line.startswith('Format:') or
            line.startswith('Voice:') or
            line.startswith('Background') or
            line.startswith('---') or
            line.startswith('RESOURCE #')):
            continue

        # Keep actual content
        if line:
            lines.append(line)

    if not lines:
        print(f"   ❌ No content in script after filtering")
        return False

    print(f"   📝 Processing {len(lines)} lines of content\n")

    # Create temp directory
    temp_dir = Path('temp_audio_segments')
    temp_dir.mkdir(exist_ok=True)

    # Process each line into audio segments
    segments = []
    segment_count = 0

    for i, line in enumerate(lines):
        # Detect language
        lang = detect_language(line)

        # Get appropriate voice and rate
        if lang == 'spanish':
            voice = SPANISH_NARRATOR
            rate = "-10%"  # Slightly slower for clarity
        else:
            voice = ENGLISH_VOICE
            rate = "-20%"  # Slower for learning (80% speed)

        # Generate this segment
        temp_file = temp_dir / f'segment_{segment_count:03d}.mp3'

        preview = line[:60] + "..." if len(line) > 60 else line
        print(f"   [{i+1}/{len(lines)}] {lang[:2].upper()}: {preview}")

        if await generate_segment(line, voice, str(temp_file), rate):
            try:
                # Load the audio segment
                audio = AudioSegment.from_mp3(str(temp_file))
                segments.append(audio)
            except Exception as e:
                print(f"   ⚠️  Error loading segment: {e}")
                continue

            # Add pause after each line
            if lang == 'english':
                # Longer pause after English phrases (1 second)
                segments.append(AudioSegment.silent(duration=1000))
            else:
                # Shorter pause after Spanish narrator (500ms)
                segments.append(AudioSegment.silent(duration=500))

            segment_count += 1

        await asyncio.sleep(0.5)  # Rate limiting

    if not segments:
        print(f"\n   ❌ No segments generated")
        return False

    # Concatenate all segments
    print(f"\n   🔄 Concatenating {len(segments)} segments...")
    final_audio = segments[0]
    for segment in segments[1:]:
        final_audio += segment

    # Export
    output_file = 'public/audio/resource-1.mp3'
    print(f"   💾 Exporting to {output_file}...")
    final_audio.export(output_file, format='mp3', bitrate='128k')

    file_size = os.path.getsize(output_file) / (1024 * 1024)
    duration = len(final_audio) / 1000  # Convert to seconds

    print("\n" + "=" * 70)
    print(f"   ✅ COMPLETE!")
    print(f"   📁 File: {output_file}")
    print(f"   💾 Size: {file_size:.1f} MB")
    print(f"   ⏱️  Duration: {duration/60:.1f} minutes ({duration:.0f} seconds)")
    print("=" * 70)

    # Cleanup temp files
    import shutil
    shutil.rmtree(temp_dir, ignore_errors=True)

    return True

if __name__ == '__main__':
    asyncio.run(generate_tutorial_audio())
