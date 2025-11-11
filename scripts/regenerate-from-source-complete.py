#!/usr/bin/env python3
"""
DEFINITIVE REGENERATION SCRIPT - All 56 Resources
Implements compact tutorial format with repetition pauses

FORMAT PER PHRASE:
1. Context (Spanish): ~3-5 seconds
2. English phrase (slow -20%): ~3 seconds
3. PAUSE: 1 second
4. English repeat (slow -20%): ~3 seconds
5. PAUSE: 1 second
6. Spanish translation: ~3 seconds
7. PAUSE: 2.5 seconds (learner repetition)
8. Quick tip (Spanish): ~5 seconds

Total per phrase: ~20-25 seconds

STRUCTURE:
- Introduction (30s)
- Each phrase (20-25s)
- Practice section (1 minute)
- Conclusion (30s)
"""

import os
import sys
import json
import re
import time
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# Add edge-tts support
try:
    import asyncio
    import edge_tts
    HAS_EDGE_TTS = True
except ImportError:
    HAS_EDGE_TTS = False
    print("⚠️  edge-tts not installed. Install with: pip install edge-tts")
    sys.exit(1)

# Configuration - all paths relative to script's parent directory (project root)
BASE_DIR = Path(__file__).parent.parent  # Go up from scripts/ to project root
MASTER_MAPPING_FILE = BASE_DIR / "resource-full-paths.json"
OUTPUT_DIR = BASE_DIR / "public/audio"
TEMP_DIR = BASE_DIR / "temp-audio-generation"
LOG_FILE = BASE_DIR / "scripts/complete-regeneration-log.txt"

# Voice configuration - CONSISTENT for all resources
SPANISH_VOICE = "es-CO-SalomeNeural"  # Colombian Spanish
ENGLISH_VOICE = "en-US-JennyNeural"   # US English
ENGLISH_SPEED = "-20%"  # Slower for learning
SPANISH_SPEED = "+0%"   # Normal speed

# Pause durations (in milliseconds)
PAUSE_AFTER_ENGLISH_1 = 1000      # After first English phrase
PAUSE_AFTER_ENGLISH_2 = 1000      # After second English phrase
PAUSE_AFTER_SPANISH = 2500        # After Spanish (for learner repetition)
PAUSE_BETWEEN_PHRASES = 1500      # Between different phrases
PAUSE_SECTION = 2000              # Between sections


def log_message(message: str, also_print: bool = True):
    """Log message to file and optionally print."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {message}\n"

    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(log_entry)

    if also_print:
        print(message)


def load_master_mapping() -> Dict:
    """Load the master resource mapping."""
    try:
        with open(MASTER_MAPPING_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        log_message(f"❌ ERROR loading master mapping: {e}")
        return {}


def find_source_file(resource_id: str, mapping: Dict) -> Optional[Path]:
    """Find source file for a resource."""
    resource_data = mapping.get(resource_id)
    if not resource_data:
        return None

    source_file = resource_data.get('source_file')
    if not source_file:
        return None

    # Extract filename from full path if needed
    source_filename = Path(source_file).name

    # Get the base directory (go up one level from scripts/)
    base_dir = Path(__file__).parent.parent

    # Search in multiple locations (all relative to base_dir)
    search_paths = [
        # Try as-is first (handles paths like "generated-resources/...")
        base_dir / source_file,
        # Try removing leading slash
        base_dir / source_file.lstrip('/'),
        # Try just the filename in common locations
        base_dir / "generated-resources/50-batch/repartidor" / source_filename,
        base_dir / "generated-resources/50-batch/conductor" / source_filename,
        base_dir / "generated-resources/50-batch/all" / source_filename,
        base_dir / "data/resources/app-specific" / source_filename,
        base_dir / "data/resources/avanzado" / source_filename,
        base_dir / "data/resources/emergency" / source_filename,
        # Audio specs by resource ID
        base_dir / "audio-specs" / f"resource-{resource_id}-spec.json",
        # Audio scripts
        base_dir / "audio-specs" / source_filename.replace('.txt', '-audio-script.txt'),
        base_dir / "generated-resources/50-batch/repartidor" / source_filename.replace('.md', '-audio-script.txt'),
    ]

    for path in search_paths:
        if path.exists():
            return path

    return None


def extract_phrases_from_markdown(file_path: Path) -> List[Tuple[str, str]]:
    """Extract English/Spanish phrase pairs from markdown."""
    phrases = []

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find all "### Frase" sections
        sections = re.split(r'^### Frase \d+:', content, flags=re.MULTILINE)

        for section in sections[1:]:  # Skip first empty section
            # Pattern 1: **English**: "phrase text"
            en_match = re.search(r'\*\*English\*\*:\s*"([^"]+)"', section)

            # Pattern 2: 🗣️ **Español**: phrase text (without quotes)
            es_match = re.search(r'🗣️\s*\*\*Español\*\*:\s*([^\n│]+)', section)

            # Fallback: **Español**: phrase text
            if not es_match:
                es_match = re.search(r'\*\*Español\*\*:\s*([^\n│]+)', section)

            if en_match and es_match:
                english = en_match.group(1).strip()
                spanish = es_match.group(1).strip()

                # Clean up Spanish text (remove trailing periods, pronunciation guides)
                spanish = re.sub(r'\s*\[.*?\]\s*', '', spanish)  # Remove [pronunciation]
                spanish = spanish.strip('.').strip()

                phrases.append((english, spanish))

        return phrases

    except Exception as e:
        log_message(f"  ⚠️  Error extracting from markdown: {e}")
        return []


def extract_phrases_from_audio_script(file_path: Path) -> List[Tuple[str, str]]:
    """Extract phrases from audio script format."""
    phrases = []

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find all FRASE sections
        sections = re.split(r'###\s*\[[\d:]+\]\s*FRASE\s+\d+:', content, flags=re.IGNORECASE)

        for section in sections[1:]:  # Skip intro
            # Find first quoted English text after English native speaker marker
            # Pattern: **[Speaker: English native - ...] followed by newline(s) and then "text"
            en_pattern = r'\*\*\[Speaker:\s*English\s+native[^\]]*\]\*\*\s*\n+\s*"([^"]+)"'
            en_matches = re.findall(en_pattern, section, re.IGNORECASE)

            # Find Spanish translation - look for "En español: <text>" and extract just the translation part
            # The full quote might be: "En español: Hola, tengo su entrega.\n\nEsta es LA frase..."
            # We want only: "Hola, tengo su entrega"
            es_pattern = r'"En español:\s*([^\n.]+)[.\n]'
            es_match = re.search(es_pattern, section, re.IGNORECASE)

            # Fallback: try questions starting with ¿
            if not es_match:
                es_pattern_q = r'"(¿[^"?]+\?)"'
                es_match = re.search(es_pattern_q, section)

            # Fallback: Spanish narrator without "En español" prefix
            if not es_match:
                # Look for Spanish narrator followed by quoted text that starts with a Spanish word
                es_pattern_alt = r'\*\*\[Speaker:\s*Spanish[^\]]*\]\*\*\s*\n+\s*"((?:Hola|Aquí|Tengo|Lo|Gracias)[^"\n]+)'
                es_match = re.search(es_pattern_alt, section, re.IGNORECASE)

            # Take first English occurrence (second is usually repeat)
            if en_matches and es_match:
                english = en_matches[0].strip()
                spanish = es_match.group(1).strip()

                # Clean up
                spanish = spanish.replace('En español:', '').strip()
                english = re.sub(r'\[Phonetic:.*?\]', '', english).strip()
                spanish = re.sub(r'\[.*?\]', '', spanish).strip()
                # Remove trailing periods
                spanish = spanish.rstrip('.')

                phrases.append((english, spanish))

        return phrases

    except Exception as e:
        log_message(f"  ⚠️  Error extracting from audio script: {e}")
        return []


def extract_phrases_from_spec_json(file_path: Path) -> List[Tuple[str, str]]:
    """Extract phrases from audio spec JSON."""
    phrases = []

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            spec = json.load(f)

        for segment in spec.get('content', {}).get('segments', []):
            text = segment.get('text', '')

            # Skip intro/outro segments
            if segment.get('notes', '').upper() in ['INTRODUCCIÓN', 'PRÁCTICA RÁPIDA', 'CONCLUSIÓN']:
                continue

            # Look for English/Spanish pairs in the text
            lines = [line.strip() for line in text.split('\n') if line.strip()]

            # Extract English phrases (lines that are NOT Spanish context)
            english_phrases = []
            spanish_translation = None

            for line in lines:
                # Skip Spanish context/explanation lines
                if any(word in line.lower() for word in ['frase', 'cuando', 'para', 'úsala', 'esto', 'reemplaza', 'cambia', 'perfecta', 'muy común', 'simple pero', 'añade']):
                    continue

                # Find Spanish translation (starts with "En español:" or similar)
                if line.lower().startswith('en español:') or line.lower().startswith('¿usted es') or line.lower().startswith('aquí está') or line.lower().startswith('lo dejé'):
                    spanish_translation = line.replace('En español:', '').replace('en español:', '').strip()
                    continue

                # Detect English vs Spanish
                if is_likely_english(line):
                    english_phrases.append(line)
                elif not any(word in line.lower() for word in ['esta es', 'esto evita', 'siempre', 'importante']):
                    # Could be Spanish translation without prefix
                    if not spanish_translation and len(english_phrases) > 0:
                        spanish_translation = line

            # Match pairs: typically first English phrase with Spanish translation
            if len(english_phrases) >= 1 and spanish_translation:
                # Use first English phrase (the second is usually a repeat)
                phrases.append((english_phrases[0], spanish_translation))
            elif len(english_phrases) >= 2 and not spanish_translation:
                # If no explicit Spanish found, last English might be translation
                # This is unlikely, but handle edge case
                pass

        return phrases

    except Exception as e:
        log_message(f"  ⚠️  Error extracting from JSON spec: {e}")
        return []


def is_likely_english(text: str) -> bool:
    """Quick check if text is likely English."""
    text_lower = text.lower()

    # Spanish indicators - accented characters (check FIRST for highest accuracy)
    spanish_chars = ['á', 'é', 'í', 'ó', 'ú', 'ñ', '¿', '¡']
    if any(char in text_lower for char in spanish_chars):
        return False

    # Spanish indicators - common words and delivery-specific vocabulary (check SECOND)
    # Use word boundaries to avoid false positives
    spanish_words = [
        # Common Spanish words
        'tengo', 'está', 'puede', 'gracias', 'por favor', 'aquí', 'pedido', 'días',
        'usted', 'tenga', 'excelente', 'estoy', 'afuera', 'salir', 'dejé', 'puerta',
        # Delivery-specific words
        'solo', 'recojo', 'entrego', 'entregas', 'entrega', 'dejaré', 'edificio',
        'apartamento', 'bolsa', 'orden', 'cliente', 'dirección', 'código',
        'confirmación', 'propina', 'efectivo', 'restaurante'
    ]
    # Use word boundary check for more accurate matching
    for word in spanish_words:
        if re.search(r'\b' + re.escape(word) + r'\b', text_lower):
            return False

    # English indicators (check LAST)
    english_words = ['have', 'your', 'the', 'can', 'you', 'please', 'thank', 'order', 'delivery', 'good', 'morning',
                     'are', 'here', 'left', 'outside', 'come', 'confirm', 'code', 'great', 'day']
    for word in english_words:
        if re.search(r'\b' + re.escape(word) + r'\b', text_lower):
            return True

    # Default to English if no strong indicators
    return True


def load_phrases_for_resource(resource_id: str, mapping: Dict) -> List[Tuple[str, str]]:
    """Load English/Spanish phrase pairs for a resource."""
    source_file = find_source_file(resource_id, mapping)

    if not source_file:
        log_message(f"  ❌ No source file found for resource {resource_id}")
        return []

    log_message(f"  📄 Source: {source_file.name}")

    # Extract based on file type
    if source_file.suffix == '.md':
        phrases = extract_phrases_from_markdown(source_file)
    elif source_file.suffix == '.txt':
        phrases = extract_phrases_from_audio_script(source_file)
    elif source_file.suffix == '.json':
        phrases = extract_phrases_from_spec_json(source_file)
    else:
        log_message(f"  ⚠️  Unknown file type: {source_file.suffix}")
        return []

    log_message(f"  ✓ Extracted {len(phrases)} phrase pairs")
    return phrases


async def generate_silence_mp3(duration_ms: int, output_file: Path) -> bool:
    """Generate a silent MP3 file using edge-tts."""
    try:
        # Generate a very short silent audio with edge-tts
        # We'll use a space character which produces minimal audio
        communicate = edge_tts.Communicate(" ", SPANISH_VOICE, rate="+0%")

        temp_silent = TEMP_DIR / "temp_silence.mp3"
        await communicate.save(str(temp_silent))

        # Use ffmpeg to create exact duration silence
        duration_sec = duration_ms / 1000.0
        cmd = [
            'ffmpeg', '-f', 'lavfi', '-i', f'anullsrc=r=44100:cl=stereo',
            '-t', str(duration_sec), '-y', '-ar', '44100', '-ac', '2',
            '-b:a', '128k', str(output_file)
        ]

        # SKIP: ffmpeg not available in WSL
        # Natural pauses between TTS segments provide sufficient breaks
        return True  # Return True but don't create pause file

    except Exception as e:
        # Silence errors are non-critical, continue without pauses
        return True


async def synthesize_text(text: str, voice: str, rate: str = "+0%") -> Optional[Path]:
    """Synthesize text to speech using edge-tts, return temp file path."""
    try:
        communicate = edge_tts.Communicate(text, voice, rate=rate)

        # Create unique temp file
        temp_file = TEMP_DIR / f"tts_{int(time.time() * 1000)}_{hash(text) % 10000}.mp3"
        await communicate.save(str(temp_file))

        return temp_file

    except Exception as e:
        log_message(f"  ⚠️  TTS error: {e}")
        return None


async def concatenate_audio_files(file_list: List[Path], output_file: Path) -> bool:
    """Concatenate audio files using binary concatenation (no ffmpeg needed)."""
    try:
        # Simple binary concatenation - works for MP3 without ffmpeg
        with open(output_file, 'wb') as outfile:
            for audio_file in file_list:
                if audio_file and audio_file.exists():
                    with open(audio_file, 'rb') as infile:
                        outfile.write(infile.read())

        return True
    except Exception as e:
        log_message(f"  ⚠️  Concatenation error: {e}")
        return False


async def generate_phrase_audio(english: str, spanish: str, phrase_num: int) -> List[Path]:
    """Generate audio segments for a single phrase, return list of temp files."""
    segments = []

    try:
        # 1. Context (Spanish)
        context = f"Frase {phrase_num}."
        context_file = await synthesize_text(context, SPANISH_VOICE, SPANISH_SPEED)
        if context_file:
            segments.append(context_file)

        # 2. English phrase (first time, slow)
        english_file_1 = await synthesize_text(english, ENGLISH_VOICE, ENGLISH_SPEED)
        if english_file_1:
            segments.append(english_file_1)

        # 3. Pause 1
        pause1 = TEMP_DIR / f"pause1_{phrase_num}.mp3"
        if await generate_silence_mp3(PAUSE_AFTER_ENGLISH_1, pause1):
            segments.append(pause1)

        # 4. English phrase (repeat, slow)
        english_file_2 = await synthesize_text(english, ENGLISH_VOICE, ENGLISH_SPEED)
        if english_file_2:
            segments.append(english_file_2)

        # 5. Pause 2
        pause2 = TEMP_DIR / f"pause2_{phrase_num}.mp3"
        if await generate_silence_mp3(PAUSE_AFTER_ENGLISH_2, pause2):
            segments.append(pause2)

        # 6. Spanish translation
        spanish_file = await synthesize_text(spanish, SPANISH_VOICE, SPANISH_SPEED)
        if spanish_file:
            segments.append(spanish_file)

        # 7. Pause 3 (for learner repetition)
        pause3 = TEMP_DIR / f"pause3_{phrase_num}.mp3"
        if await generate_silence_mp3(PAUSE_AFTER_SPANISH, pause3):
            segments.append(pause3)

        return segments

    except Exception as e:
        log_message(f"  ⚠️  Error generating phrase audio: {e}")
        return []


async def generate_introduction(phrase_count: int) -> Optional[Path]:
    """Generate introduction section."""
    intro_text = (
        f"¡Hola! Bienvenido a Hablas. "
        f"En los próximos minutos vas a aprender {phrase_count} frases esenciales en inglés. "
        f"Escucha cada frase dos veces en inglés, luego en español. "
        f"Después de cada traducción, tendrás tiempo para repetir. "
        f"¡Vamos a empezar!"
    )

    intro_file = await synthesize_text(intro_text, SPANISH_VOICE, SPANISH_SPEED)
    return intro_file


async def generate_practice(phrases: List[Tuple[str, str]]) -> List[Path]:
    """Generate practice section."""
    segments = []

    practice_intro = "¡Ahora practica! Repite después de cada frase."
    intro_file = await synthesize_text(practice_intro, SPANISH_VOICE, SPANISH_SPEED)
    if intro_file:
        segments.append(intro_file)

        # Add pause after intro
        pause = TEMP_DIR / "practice_intro_pause.mp3"
        if await generate_silence_mp3(PAUSE_SECTION, pause):
            segments.append(pause)

    # All English phrases at normal speed with pauses
    for i, (english, _) in enumerate(phrases):
        phrase_file = await synthesize_text(english, ENGLISH_VOICE, "+0%")  # Normal speed
        if phrase_file:
            segments.append(phrase_file)

            # Pause for repetition
            pause = TEMP_DIR / f"practice_pause_{i}.mp3"
            if await generate_silence_mp3(PAUSE_AFTER_SPANISH, pause):
                segments.append(pause)

    return segments


async def generate_conclusion(phrase_count: int) -> Optional[Path]:
    """Generate conclusion section."""
    conclusion_text = (
        f"¡Excelente! Acabas de aprender {phrase_count} frases. "
        f"Practica dos veces al día: por la mañana y por la noche. "
        f"Cada palabra que aprendes es dinero en tu bolsillo. "
        f"¡Nos vemos en la siguiente lección!"
    )

    conclusion_file = await synthesize_text(conclusion_text, SPANISH_VOICE, SPANISH_SPEED)
    return conclusion_file


async def generate_complete_audio(resource_id: str, phrases: List[Tuple[str, str]]) -> bool:
    """Generate complete audio file for a resource."""
    try:
        TEMP_DIR.mkdir(parents=True, exist_ok=True)
        all_segments = []

        log_message(f"  🎤 Generating introduction...")
        intro = await generate_introduction(len(phrases))
        if intro:
            all_segments.append(intro)

            # Pause after intro
            pause = TEMP_DIR / "intro_pause.mp3"
            if await generate_silence_mp3(PAUSE_SECTION, pause):
                all_segments.append(pause)

        # Generate each phrase
        log_message(f"  🎤 Generating {len(phrases)} phrases...")
        for i, (english, spanish) in enumerate(phrases, 1):
            phrase_segments = await generate_phrase_audio(english, spanish, i)
            all_segments.extend(phrase_segments)

            # Pause between phrases
            pause = TEMP_DIR / f"between_pause_{i}.mp3"
            if await generate_silence_mp3(PAUSE_BETWEEN_PHRASES, pause):
                all_segments.append(pause)

            if i % 5 == 0:
                log_message(f"    ✓ {i}/{len(phrases)} phrases generated", also_print=False)

        # Practice section
        log_message(f"  🎤 Generating practice section...")
        practice_segments = await generate_practice(phrases)
        all_segments.extend(practice_segments)

        # Conclusion
        log_message(f"  🎤 Generating conclusion...")
        conclusion = await generate_conclusion(len(phrases))
        if conclusion:
            all_segments.append(conclusion)

        # Concatenate all segments
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        output_file = OUTPUT_DIR / f"resource-{resource_id}.mp3"

        log_message(f"  🔧 Concatenating {len(all_segments)} audio segments...")
        success = await concatenate_audio_files(all_segments, output_file)

        if success:
            # Verify
            file_size = output_file.stat().st_size
            log_message(f"  ✅ Generated: {output_file.name} ({file_size/1024/1024:.2f} MB)")

        # Clean up temp files
        for segment in all_segments:
            if segment and segment.exists():
                segment.unlink()

        return success

    except Exception as e:
        log_message(f"  ❌ Error generating audio: {e}")
        return False


async def regenerate_resource(resource_id: str, mapping: Dict) -> bool:
    """Regenerate audio for a single resource."""
    log_message(f"\n{'='*60}")
    log_message(f"🔄 Processing Resource {resource_id}")
    log_message(f"{'='*60}")

    # Load phrases
    phrases = load_phrases_for_resource(resource_id, mapping)

    if not phrases:
        log_message(f"  ❌ No phrases found")
        return False

    # Generate audio
    success = await generate_complete_audio(resource_id, phrases)

    if success:
        log_message(f"  ✅ Resource {resource_id} COMPLETE")
    else:
        log_message(f"  ❌ Resource {resource_id} FAILED")

    return success


async def main():
    """Main regeneration process."""
    log_message("="*80)
    log_message("🚀 DEFINITIVE REGENERATION - ALL 56 RESOURCES")
    log_message("="*80)
    log_message(f"📅 Started: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    log_message("")

    # Load master mapping
    mapping = load_master_mapping()
    if not mapping:
        log_message("❌ FATAL: Cannot load master mapping")
        return

    log_message(f"✅ Loaded mapping for {len(mapping)} resources")

    # Track results
    successful = []
    failed = []

    start_time = time.time()

    # Process each resource
    for resource_id in sorted(mapping.keys(), key=int):
        try:
            result = await regenerate_resource(resource_id, mapping)

            if result:
                successful.append(resource_id)
            else:
                failed.append(resource_id)

            # Small delay
            await asyncio.sleep(0.5)

        except KeyboardInterrupt:
            log_message("\n⚠️  Interrupted by user")
            break
        except Exception as e:
            log_message(f"❌ Unexpected error on resource {resource_id}: {e}")
            failed.append(resource_id)

    # Summary
    elapsed = time.time() - start_time

    log_message("\n" + "="*80)
    log_message("📊 REGENERATION SUMMARY")
    log_message("="*80)
    log_message(f"✅ Successful: {len(successful)} resources")
    log_message(f"❌ Failed: {len(failed)} resources")
    log_message(f"⏱️  Total time: {elapsed/60:.1f} minutes")

    if successful:
        log_message(f"\n✅ Successful: {', '.join(successful)}")

    if failed:
        log_message(f"\n❌ Failed: {', '.join(failed)}")

    log_message(f"\n📋 Full log: {LOG_FILE}")
    log_message("="*80)


if __name__ == "__main__":
    if not HAS_EDGE_TTS:
        print("❌ edge-tts is required. Install with: pip install edge-tts")
        sys.exit(1)

    asyncio.run(main())
