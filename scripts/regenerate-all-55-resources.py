#!/usr/bin/env python3
"""
Master Regeneration Script for All 55 Resources (2-59)
Uses FIXED is_spanish() with word boundary matching
Processes existing phrase files from scripts/final-phrases-only/
"""

import asyncio
import edge_tts
from pathlib import Path
import re
import sys
from datetime import datetime

# Voice configuration
SPANISH_VOICE = 'es-CO-SalomeNeural'
ENGLISH_VOICE = 'en-US-JennyNeural'

# Paths
BASE_DIR = Path(__file__).parent.parent
PHRASES_DIR = BASE_DIR / 'scripts' / 'final-phrases-only'
OUTPUT_DIR = BASE_DIR / 'public' / 'audio'

# Ensure output directory exists
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Progress tracking
total_resources = 0
successful_resources = 0
failed_resources = []
skipped_resources = []

def is_spanish(text: str) -> bool:
    """
    FIXED version with word boundary matching
    Detects if text is Spanish based on:
    1. Spanish-specific characters (á, é, í, ó, ú, ñ, ¿, ¡)
    2. Common Spanish words with word boundaries
    """
    # Check for Spanish characters
    if any(c in text for c in 'áéíóúñ¿¡'):
        return True

    # Common Spanish words - use word boundaries
    spanish_words = [
        # Verbs
        'hola', 'tengo', 'soy', 'vas', 'vamos', 'escucha', 'llegas', 'gira', 'voltea',
        'sigue', 'haz', 'has', 'llegaste', 'tienes', 'necesitas', 'puedes', 'puede',
        'está', 'estás', 'son', 'eres', 'reemplaza', 'menciona', 'ayudarme',
        # Nouns
        'bienvenido', 'repartidor', 'instructor', 'entregas', 'español', 'frase',
        'dirección', 'cliente', 'pedido', 'propina', 'edificio', 'restaurante',
        'semáforo', 'señal', 'destino', 'izquierda', 'derecha', 'retorno', 'vuelta',
        'luz', 'alto', 'pies', 'metros', 'nombre', 'apartamento', 'bebidas',
        # Articles and pronouns
        'para', 'con', 'una', 'que', 'tu', 'mi', 'lo', 'las', 'los', 'del', 'la', 'el',
        'su', 'sus', 'esta', 'este', 'ese', 'esa',
        # Common words
        'número', 'cuando', 'también', 'muy', 'bien', 'siguiente', 'próxima',
        'diarias', 'grandes', 'todos', 'amable', 'útil', 'excelente',
        # Phrases
        'por favor', 'muchas gracias', 'de nada', 'qué tal'
    ]

    text_lower = text.lower()
    for word in spanish_words:
        # Use word boundaries to match whole words only
        if re.search(r'\b' + re.escape(word) + r'\b', text_lower):
            return True

    return False

async def generate_audio_for_phrase(text: str, output_path: Path) -> bool:
    """Generate audio for a single phrase"""
    try:
        voice = SPANISH_VOICE if is_spanish(text) else ENGLISH_VOICE
        lang_marker = "ES" if is_spanish(text) else "EN"

        # Debug output
        print(f"  [{lang_marker}] {text[:50]}...")

        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(str(output_path))
        return True
    except Exception as e:
        print(f"  ❌ ERROR generating phrase: {e}")
        return False

async def concatenate_audio_files(audio_files: list, output_path: Path) -> bool:
    """Concatenate multiple audio files into one using binary concatenation"""
    try:
        # Simple binary concatenation approach
        # This works for MP3 files without requiring ffmpeg
        with open(output_path, 'wb') as outfile:
            for audio_file in audio_files:
                if audio_file.exists():
                    with open(audio_file, 'rb') as infile:
                        outfile.write(infile.read())

        # Clean up temporary files
        for audio_file in audio_files:
            if audio_file.exists() and audio_file.parent.name == 'temp':
                audio_file.unlink()

        return True
    except Exception as e:
        print(f"  ❌ ERROR concatenating audio: {e}")
        return False

def parse_phrases_from_file(phrase_file: Path) -> list:
    """Parse phrases from text file - handles both quoted and structured formats"""
    try:
        content = phrase_file.read_text(encoding='utf-8')
        phrases = []

        # Try quoted format first (resources like 2, 7, 13, etc.)
        for line in content.split('\n'):
            line = line.strip()
            if line.startswith('"') and line.endswith('"'):
                phrase = line[1:-1]
                if phrase:
                    phrases.append(phrase)

        # If no quotes found, use structured format (resources like 4, 5, 6, etc.)
        if not phrases:
            lines = content.split('\n')
            i = 0
            while i < len(lines):
                line = lines[i].strip()

                # Skip empty lines, headers, and metadata
                if (not line or
                    line.startswith('#') or
                    line.startswith('**') or
                    line.startswith('━') or
                    line.startswith('===') or
                    line.startswith('[Tip:') or
                    line.startswith('[Note:') or
                    line.startswith('[Context:') or
                    line.startswith('SECTION ') or
                    line.startswith('---')):
                    i += 1
                    continue

                # Add non-empty content lines
                if line and len(line) > 3:  # Skip very short lines
                    phrases.append(line)

                i += 1

        return phrases
    except Exception as e:
        print(f"  ❌ ERROR reading phrase file: {e}")
        return []

async def generate_resource(resource_id: int) -> bool:
    """Generate audio for a single resource"""
    global successful_resources, failed_resources, skipped_resources

    print(f"\n{'='*70}")
    print(f"Processing Resource {resource_id}")
    print(f"{'='*70}")

    # Check if phrase file exists
    phrase_file = PHRASES_DIR / f'resource-{resource_id}.txt'
    if not phrase_file.exists():
        print(f"  ⚠️  Phrase file not found: {phrase_file}")
        skipped_resources.append(resource_id)
        return False

    # Parse phrases
    phrases = parse_phrases_from_file(phrase_file)
    if not phrases:
        print(f"  ⚠️  No phrases found in file")
        skipped_resources.append(resource_id)
        return False

    print(f"  Found {len(phrases)} phrases")

    # Create temp directory for individual audio files
    temp_dir = OUTPUT_DIR / 'temp'
    temp_dir.mkdir(exist_ok=True)

    # Generate audio for each phrase
    temp_files = []
    for i, phrase in enumerate(phrases):
        temp_file = temp_dir / f'resource-{resource_id}-phrase-{i}.mp3'
        success = await generate_audio_for_phrase(phrase, temp_file)
        if success:
            temp_files.append(temp_file)
        else:
            print(f"  ⚠️  Failed to generate phrase {i}")

    # Concatenate all audio files
    output_file = OUTPUT_DIR / f'resource-{resource_id}.mp3'
    print(f"\n  Concatenating {len(temp_files)} audio files...")
    success = await concatenate_audio_files(temp_files, output_file)

    # Clean up temp directory
    if temp_dir.exists():
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)

    if success:
        file_size = output_file.stat().st_size / (1024 * 1024)  # MB
        print(f"  ✅ SUCCESS: Generated {output_file.name} ({file_size:.2f} MB)")
        successful_resources += 1
        return True
    else:
        print(f"  ❌ FAILED: Could not generate audio for resource {resource_id}")
        failed_resources.append(resource_id)
        return False

async def test_resources(resource_ids: list):
    """Test with a few resources first"""
    print("\n" + "="*70)
    print("TESTING MODE - Processing sample resources")
    print("="*70)

    for resource_id in resource_ids:
        await generate_resource(resource_id)

    print_summary()

async def regenerate_all_resources():
    """Regenerate all 55 resources (2-59, excluding 3, 8, 24)"""
    global total_resources

    # Resources to process (2-59, excluding 3, 8, 24)
    excluded = {3, 8, 24}
    resource_ids = [rid for rid in range(2, 60) if rid not in excluded]
    total_resources = len(resource_ids)

    print("\n" + "="*70)
    print("MASTER REGENERATION SCRIPT")
    print("="*70)
    print(f"Total resources to process: {total_resources}")
    print(f"Excluded resources: {sorted(excluded)}")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)

    # Process each resource
    for i, resource_id in enumerate(resource_ids, 1):
        print(f"\n[{i}/{total_resources}] Processing resource {resource_id}...")
        await generate_resource(resource_id)

        # Progress update every 10 resources
        if i % 10 == 0:
            print(f"\n{'='*70}")
            print(f"PROGRESS UPDATE: {i}/{total_resources} resources processed")
            print(f"Success: {successful_resources}, Failed: {len(failed_resources)}, Skipped: {len(skipped_resources)}")
            print(f"{'='*70}")

    print_summary()

def print_summary():
    """Print final summary"""
    print("\n" + "="*70)
    print("REGENERATION SUMMARY")
    print("="*70)
    print(f"Total resources: {total_resources}")
    print(f"✅ Successful: {successful_resources}")
    print(f"❌ Failed: {len(failed_resources)}")
    print(f"⚠️  Skipped: {len(skipped_resources)}")

    if failed_resources:
        print(f"\nFailed resources: {failed_resources}")
    if skipped_resources:
        print(f"Skipped resources: {skipped_resources}")

    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)

async def main():
    """Main entry point"""
    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        # Test mode - process only a few resources
        test_ids = [2, 7, 13]
        await test_resources(test_ids)
    else:
        # Full regeneration
        await regenerate_all_resources()

if __name__ == '__main__':
    asyncio.run(main())
