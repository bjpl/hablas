#!/usr/bin/env python3
"""
Master Regeneration Script for All 55 Resources (2-59)
Implements FIXED voice detection with word boundaries
Includes error recovery, progress tracking, and verification
"""

import os
import json
import re
import time
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from google.cloud import texttospeech
from pydub import AudioSegment

# Configuration
RESOURCE_RANGE = range(2, 60)  # Resources 2-59
OUTPUT_DIR = Path("public/audio")
AUDIO_SPECS_DIR = Path("audio-specs")
PHRASE_FILES_DIR = Path("extracted-phrases")
TEMP_DIR = Path("temp-audio-segments")
LOG_FILE = Path("scripts/regeneration-log.txt")

# Voice configuration
SPANISH_VOICE = texttospeech.VoiceSelectionParams(
    language_code="es-US",
    name="es-US-Neural2-B",
    ssml_gender=texttospeech.SsmlVoiceGender.MALE
)

ENGLISH_VOICE = texttospeech.VoiceSelectionParams(
    language_code="en-US",
    name="en-US-Neural2-J",
    ssml_gender=texttospeech.SsmlVoiceGender.MALE
)

AUDIO_CONFIG = texttospeech.AudioConfig(
    audio_encoding=texttospeech.AudioEncoding.MP3,
    speaking_rate=1.0,
    pitch=0.0,
    effects_profile_id=["small-bluetooth-speaker-class-device"]
)

# FIXED is_spanish() function with word boundaries
def is_spanish(text: str) -> bool:
    """
    Determine if text is Spanish using FIXED word boundary detection.
    Returns True for Spanish, False for English.

    CRITICAL FIX: Uses word boundaries to avoid false positives
    Example: "customer" should NOT trigger "tome" pattern
    """
    text_lower = text.lower().strip()

    # Empty or very short
    if len(text_lower) < 3:
        return False

    # Spanish-only words with word boundaries (most reliable)
    spanish_patterns = [
        r'\b(hola|buenos|días|gracias|por favor|perdón|disculpe)\b',
        r'\b(está|están|estás|estoy|tengo|tiene|necesito)\b',
        r'\b(aquí|allí|dónde|cuándo|cómo|qué|quién)\b',
        r'\b(usted|señor|señora|cliente)\b',
        r'\b(entrega|pedido|orden|domicilio)\b',
        r'\b(minutos|momento|espera|llego)\b',
        r'\b(confirmación|código|número|dirección)\b',
        r'\b(tome|deje|dejé|puedo|puede)\b',  # FIX: Word boundaries prevent "customer" match
        r'\b(su|mi|tu|tus|sus|mis)\b',
        r'\b(el|la|los|las|un|una)\b',
        r'\b(en|de|del|para|con|sin)\b'
    ]

    for pattern in spanish_patterns:
        if re.search(pattern, text_lower):
            return True

    # Spanish accents/ñ are definitive
    if re.search(r'[áéíóúñ¿¡]', text_lower):
        return True

    # English-only indicators with word boundaries
    english_patterns = [
        r'\b(hello|hi|hey|good morning|good evening)\b',
        r'\b(thank you|thanks|please|sorry|excuse me)\b',
        r'\b(customer|delivery|order|address)\b',
        r'\b(have|your|from|can you|could you)\b',
        r'\b(minutes|moment|wait|arrive)\b',
        r'\b(code|number|confirm|confirmation)\b',
        r'\b(left|leave|take|door)\b',
        r'\b(outside|inside|here|there)\b',
        r'\b(the|and|or|but|with|without)\b'
    ]

    for pattern in english_patterns:
        if re.search(pattern, text_lower):
            return False

    # Default: check for Spanish question marks
    if text_lower.startswith('¿') or '¿' in text_lower:
        return True

    # Final fallback: assume English for safety
    return False


def log_message(message: str, also_print: bool = True):
    """Log message to file and optionally print to console."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {message}\n"

    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(log_entry)

    if also_print:
        print(message)


def find_source_file(resource_id: int) -> Optional[Path]:
    """Find the source file for a resource (phrase file or spec JSON)."""
    # Try phrase file first
    phrase_file = PHRASE_FILES_DIR / f"resource-{resource_id}-phrases.txt"
    if phrase_file.exists():
        return phrase_file

    # Try audio spec JSON
    spec_file = AUDIO_SPECS_DIR / f"resource-{resource_id}-spec.json"
    if spec_file.exists():
        return spec_file

    return None


def extract_phrases_from_spec(spec_file: Path) -> List[str]:
    """Extract phrases from audio spec JSON file."""
    try:
        with open(spec_file, 'r', encoding='utf-8') as f:
            spec = json.load(f)

        phrases = []
        for segment in spec.get('content', {}).get('segments', []):
            text = segment.get('text', '').strip()
            if text:
                # Split by newlines and filter empty
                for line in text.split('\n'):
                    line = line.strip()
                    if line and len(line) > 5:  # Skip very short lines
                        phrases.append(line)

        return phrases
    except Exception as e:
        log_message(f"ERROR extracting phrases from {spec_file}: {e}")
        return []


def load_phrases(resource_id: int) -> Optional[List[str]]:
    """Load phrases for a resource from any available source."""
    source_file = find_source_file(resource_id)
    if not source_file:
        log_message(f"⚠️  No source file found for resource {resource_id}")
        return None

    try:
        if source_file.suffix == '.txt':
            # Load from phrase file
            with open(source_file, 'r', encoding='utf-8') as f:
                phrases = [line.strip() for line in f if line.strip()]
            log_message(f"📄 Loaded {len(phrases)} phrases from {source_file.name}")
            return phrases

        elif source_file.suffix == '.json':
            # Extract from spec JSON
            phrases = extract_phrases_from_spec(source_file)
            log_message(f"📄 Extracted {len(phrases)} phrases from {source_file.name}")
            return phrases

        else:
            log_message(f"⚠️  Unknown source file type: {source_file}")
            return None

    except Exception as e:
        log_message(f"ERROR loading phrases for resource {resource_id}: {e}")
        return None


def create_compact_script(phrases: List[str]) -> str:
    """Create compact audio script from phrases."""
    script_lines = []

    for i, phrase in enumerate(phrases, 1):
        phrase = phrase.strip()
        if not phrase:
            continue

        # Detect language using FIXED function
        if is_spanish(phrase):
            script_lines.append(f"[SPANISH] {phrase}")
        else:
            script_lines.append(f"[ENGLISH] {phrase}")

    return '\n'.join(script_lines)


def synthesize_segment(text: str, voice: texttospeech.VoiceSelectionParams, client: texttospeech.TextToSpeechClient) -> Optional[bytes]:
    """Synthesize a single text segment to audio."""
    try:
        synthesis_input = texttospeech.SynthesisInput(text=text)
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=AUDIO_CONFIG
        )
        return response.audio_content
    except Exception as e:
        log_message(f"ERROR synthesizing segment: {e}")
        return None


def generate_audio_for_resource(resource_id: int, phrases: List[str], client: texttospeech.TextToSpeechClient) -> bool:
    """Generate complete audio file for a resource."""
    try:
        # Create temp directory
        TEMP_DIR.mkdir(parents=True, exist_ok=True)

        # Combine all segments
        combined_audio = AudioSegment.silent(duration=500)  # Start with 0.5s silence

        for i, phrase in enumerate(phrases):
            phrase = phrase.strip()
            if not phrase:
                continue

            # Detect voice using FIXED function
            voice = SPANISH_VOICE if is_spanish(phrase) else ENGLISH_VOICE
            lang = "ES" if voice == SPANISH_VOICE else "EN"

            # Synthesize
            audio_content = synthesize_segment(phrase, voice, client)
            if not audio_content:
                log_message(f"  ⚠️  Failed to synthesize phrase {i+1}: {phrase[:50]}...")
                continue

            # Save temp segment
            temp_file = TEMP_DIR / f"segment_{i}.mp3"
            with open(temp_file, 'wb') as f:
                f.write(audio_content)

            # Load and append
            segment_audio = AudioSegment.from_mp3(temp_file)
            combined_audio += segment_audio
            combined_audio += AudioSegment.silent(duration=800)  # 0.8s pause

            # Clean up temp file
            temp_file.unlink()

            if (i + 1) % 10 == 0:
                log_message(f"  ✓ Processed {i+1}/{len(phrases)} phrases", also_print=False)

        # Add ending silence
        combined_audio += AudioSegment.silent(duration=500)

        # Export final audio
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        output_file = OUTPUT_DIR / f"resource-{resource_id}.mp3"
        combined_audio.export(
            output_file,
            format="mp3",
            bitrate="128k",
            parameters=["-ar", "44100", "-ac", "2"]
        )

        # Verify output
        file_size = output_file.stat().st_size
        duration = len(combined_audio) / 1000  # seconds

        log_message(f"  ✅ Generated: {output_file.name} ({file_size/1024/1024:.2f} MB, {duration:.1f}s)")

        return True

    except Exception as e:
        log_message(f"ERROR generating audio for resource {resource_id}: {e}")
        return False


def verify_output(resource_id: int) -> bool:
    """Verify that audio output is valid."""
    output_file = OUTPUT_DIR / f"resource-{resource_id}.mp3"

    if not output_file.exists():
        log_message(f"  ❌ Output file missing: {output_file}")
        return False

    file_size = output_file.stat().st_size

    # Check file size (should be 100KB - 20MB)
    if file_size < 100_000:
        log_message(f"  ❌ File too small: {file_size/1024:.1f} KB")
        return False

    if file_size > 20_000_000:
        log_message(f"  ⚠️  File very large: {file_size/1024/1024:.1f} MB")

    return True


def regenerate_single_resource(resource_id: int, client: texttospeech.TextToSpeechClient) -> bool:
    """Regenerate audio for a single resource."""
    log_message(f"\n{'='*60}")
    log_message(f"🔄 Processing Resource {resource_id}")
    log_message(f"{'='*60}")

    # Load phrases
    phrases = load_phrases(resource_id)
    if not phrases:
        log_message(f"❌ Resource {resource_id}: No phrases found")
        return False

    log_message(f"📝 Found {len(phrases)} phrases")

    # Create script (for logging/debugging)
    script = create_compact_script(phrases)
    script_file = Path(f"scripts/temp-script-{resource_id}.txt")
    with open(script_file, 'w', encoding='utf-8') as f:
        f.write(script)
    log_message(f"📄 Script saved: {script_file}")

    # Generate audio
    log_message(f"🎤 Generating audio...")
    success = generate_audio_for_resource(resource_id, phrases, client)

    if not success:
        log_message(f"❌ Resource {resource_id}: Audio generation failed")
        return False

    # Verify output
    if not verify_output(resource_id):
        log_message(f"❌ Resource {resource_id}: Verification failed")
        return False

    log_message(f"✅ Resource {resource_id}: COMPLETE")

    # Clean up temp script
    if script_file.exists():
        script_file.unlink()

    return True


def main():
    """Main regeneration process for all resources."""
    log_message("="*80)
    log_message("🚀 MASTER REGENERATION SCRIPT - ALL 55 RESOURCES")
    log_message("="*80)
    log_message(f"📅 Started: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    log_message(f"🎯 Target: Resources {min(RESOURCE_RANGE)} - {max(RESOURCE_RANGE)}")
    log_message("")

    # Initialize Google Cloud TTS client
    try:
        client = texttospeech.TextToSpeechClient()
        log_message("✅ Google Cloud TTS client initialized")
    except Exception as e:
        log_message(f"❌ FATAL: Failed to initialize TTS client: {e}")
        return

    # Track results
    successful = []
    failed = []
    skipped = []

    start_time = time.time()

    # Process each resource
    for i, resource_id in enumerate(RESOURCE_RANGE, 1):
        try:
            log_message(f"\n[{i}/{len(RESOURCE_RANGE)}] Processing resource {resource_id}...")

            result = regenerate_single_resource(resource_id, client)

            if result:
                successful.append(resource_id)
            else:
                failed.append(resource_id)

            # Small delay to avoid rate limits
            time.sleep(1)

        except KeyboardInterrupt:
            log_message("\n\n⚠️  Process interrupted by user")
            break
        except Exception as e:
            log_message(f"❌ Unexpected error on resource {resource_id}: {e}")
            failed.append(resource_id)

    # Final summary
    elapsed_time = time.time() - start_time

    log_message("\n" + "="*80)
    log_message("📊 REGENERATION SUMMARY")
    log_message("="*80)
    log_message(f"✅ Successful: {len(successful)} resources")
    log_message(f"❌ Failed: {len(failed)} resources")
    log_message(f"⏭️  Skipped: {len(skipped)} resources")
    log_message(f"⏱️  Total time: {elapsed_time/60:.1f} minutes")
    log_message(f"📅 Completed: {time.strftime('%Y-%m-%d %H:%M:%S')}")

    if successful:
        log_message(f"\n✅ Successful resources: {', '.join(map(str, successful))}")

    if failed:
        log_message(f"\n❌ Failed resources: {', '.join(map(str, failed))}")
        log_message("\nTo retry failed resources, run:")
        for res_id in failed:
            log_message(f"  python scripts/regenerate-single-resource.py --resource-id {res_id}")

    log_message("\n" + "="*80)
    log_message(f"📋 Full log saved to: {LOG_FILE}")
    log_message("="*80)


if __name__ == "__main__":
    main()
