#!/usr/bin/env python3
"""
Regenerate ALL audio files with proper text extraction from markdown and scripts.
Handles both lesson content and dialogue scripts intelligently.
"""

import os
import re
from pathlib import Path
from gtts import gTTS
import time

# Base directories
LESSONS_DIR = Path("out/generated-resources/50-batch")
AUDIO_DIR = Path("out/audio")
SCRIPTS_DIR = LESSONS_DIR  # Scripts are in the same directory structure

# Audio generation settings
AUDIO_SETTINGS = {
    'slow': True,  # Slower speech for learners
    'lang_en': 'en',
    'lang_es': 'es'
}

def extract_lesson_phrases(markdown_content: str) -> list:
    """
    Extract speakable phrases from lesson markdown.
    Returns list of (english, spanish, pronunciation) tuples.
    """
    phrases = []

    # Split into sections
    sections = markdown_content.split('\n\n')

    for section in sections:
        lines = section.strip().split('\n')

        # Look for phrase patterns
        english = None
        spanish = None
        pronunciation = None

        for line in lines:
            # Skip box drawing characters and headers
            if any(char in line for char in ['│', '┌', '└', '─', '━', '═']):
                continue
            if line.startswith('#') or line.startswith('##'):
                continue

            # Extract English
            if line.startswith('English:') or '**English:**' in line:
                english = re.sub(r'\*\*English:\*\*|\*\*|English:', '', line).strip()

            # Extract Spanish
            elif line.startswith('Español:') or '**Español:**' in line:
                spanish = re.sub(r'\*\*Español:\*\*|\*\*|Español:', '', line).strip()

            # Extract Pronunciation
            elif line.startswith('Pronunciation:') or 'Pronunciación:' in line:
                pronunciation = re.sub(r'Pronunciation:|Pronunciación:|\*\*', '', line).strip()

        # Add phrase if we found content
        if english and spanish:
            phrases.append({
                'english': english,
                'spanish': spanish,
                'pronunciation': pronunciation or ''
            })

    return phrases

def extract_script_dialogue(script_content: str) -> list:
    """
    Extract dialogue from production audio scripts.
    Returns list of text segments (Spanish and English) for audio generation.
    """
    segments = {'spanish': [], 'english': []}

    # Split by lines
    lines = script_content.split('\n')

    for line in lines:
        line = line.strip()

        # Skip empty lines, comments, headers, stage directions
        if not line:
            continue
        if line.startswith(('#', '---', '```', '[', '*', '###')):
            continue
        if line.startswith('//') or line.startswith('##'):
            continue

        # Skip production notes and timing markers
        if any(marker in line.lower() for marker in ['[pause:', '[tone:', '[speaker:', '[phonetic:', '[english', '[spanish', 'duration:', 'target:', 'focus:']):
            continue

        # Clean up quotes
        line = line.strip('"').strip("'")

        # Detect language and extract actual speakable content
        # Spanish content (contains Spanish characters or common Spanish words)
        if any(char in line for char in ['¿', '¡', 'á', 'é', 'í', 'ó', 'ú', 'ñ']):
            # Remove quotes and clean
            clean_line = line.strip('"').strip("'")
            if len(clean_line) > 10:  # Skip very short fragments
                segments['spanish'].append(clean_line)

        # English phrases (typically short, instructional phrases)
        elif line.startswith('"') and line.endswith('"'):
            clean_line = line.strip('"')
            # Check if it's actual English content (not metadata)
            if len(clean_line.split()) <= 15 and not any(word in clean_line.lower() for word in ['audio', 'script', 'production', 'narrator', 'quality']):
                segments['english'].append(clean_line)

    return segments

def generate_lesson_audio(lesson_num: int, phrases: list) -> bool:
    """
    Generate audio for lesson phrases.
    Creates both full lesson and individual phrase audio files.
    """
    try:
        # Create combined text for full lesson
        spanish_texts = []
        english_texts = []

        for phrase in phrases:
            spanish_texts.append(phrase['spanish'])
            english_texts.append(phrase['english'])

        if not spanish_texts:
            print(f"    ⚠️  No phrases found for Lesson {lesson_num}")
            return False

        # Generate full Spanish audio
        spanish_full = '. '.join(spanish_texts)
        spanish_audio = gTTS(text=spanish_full, lang='es', slow=True)
        spanish_path = AUDIO_DIR / f"lesson-{lesson_num:02d}-es.mp3"
        spanish_audio.save(str(spanish_path))
        print(f"    ✅ Generated: {spanish_path.name} ({len(spanish_full)} chars)")

        time.sleep(0.5)  # Rate limiting

        # Generate full English audio
        english_full = '. '.join(english_texts)
        english_audio = gTTS(text=english_full, lang='en', slow=True)
        english_path = AUDIO_DIR / f"lesson-{lesson_num:02d}-en.mp3"
        english_audio.save(str(english_path))
        print(f"    ✅ Generated: {english_path.name} ({len(english_full)} chars)")

        time.sleep(0.5)  # Rate limiting

        return True

    except Exception as e:
        print(f"    ❌ Error generating audio for Lesson {lesson_num}: {e}")
        return False

def generate_script_audio(script_name: str, segments: dict) -> bool:
    """
    Generate audio for production scripts.
    Creates separate Spanish and English audio files.
    """
    try:
        if not segments or (not segments.get('spanish') and not segments.get('english')):
            print(f"    ⚠️  No content found in {script_name}")
            return False

        generated = False

        # Generate Spanish audio
        if segments.get('spanish'):
            spanish_text = '. '.join(segments['spanish'])
            if len(spanish_text) > 20:  # Minimum viable content
                spanish_audio = gTTS(text=spanish_text, lang='es', slow=True)
                spanish_path = AUDIO_DIR / f"{script_name}-es.mp3"
                spanish_audio.save(str(spanish_path))
                print(f"    ✅ Spanish: {spanish_path.name} ({len(spanish_text)} chars, {len(segments['spanish'])} segments)")
                generated = True
                time.sleep(2)  # Longer delay to avoid rate limits

        # Generate English audio
        if segments.get('english'):
            english_text = '. '.join(segments['english'])
            if len(english_text) > 20:  # Minimum viable content
                english_audio = gTTS(text=english_text, lang='en', slow=True)
                english_path = AUDIO_DIR / f"{script_name}-en.mp3"
                english_audio.save(str(english_path))
                print(f"    ✅ English: {english_path.name} ({len(english_text)} chars, {len(segments['english'])} segments)")
                generated = True
                time.sleep(2)  # Longer delay to avoid rate limits

        return generated

    except Exception as e:
        print(f"    ❌ Error generating audio for {script_name}: {e}")
        return False

def main():
    """Main execution function."""
    print("🎯 COMPLETE AUDIO REGENERATION WITH PROPER TEXT EXTRACTION")
    print("=" * 70)

    # Ensure audio directory exists
    AUDIO_DIR.mkdir(exist_ok=True)

    success_count = 0
    total_count = 0

    # Process all audio script files (in nested directories)
    print("\n🎬 PROCESSING DIALOGUE SCRIPT FILES")
    print("-" * 70)

    if SCRIPTS_DIR.exists():
        # Find all audio-script.txt files recursively
        script_files = sorted(SCRIPTS_DIR.rglob("*-audio-script.txt"))

        for script_file in script_files:
            script_name = script_file.stem.replace('-audio-script', '')
            # Get relative path for better naming
            rel_path = script_file.relative_to(SCRIPTS_DIR)
            category = rel_path.parent.name

            print(f"\n🎭 [{category}] {script_file.name}")

            # Read and parse script
            content = script_file.read_text(encoding='utf-8')
            segments = extract_script_dialogue(content)

            spanish_count = len(segments.get('spanish', []))
            english_count = len(segments.get('english', []))
            print(f"    💬 Extracted {spanish_count} Spanish + {english_count} English segments")

            # Generate audio with category prefix
            audio_name = f"{category}_{script_name}"
            total_count += 1
            if generate_script_audio(audio_name, segments):
                success_count += 1
    else:
        print("    ⚠️  Scripts directory not found")

    # Final summary
    print("\n" + "=" * 70)
    print(f"✨ COMPLETE: {success_count}/{total_count} audio files generated successfully")
    print("=" * 70)

    # List generated files
    audio_files = sorted(AUDIO_DIR.glob("*.mp3"))
    print(f"\n📁 Total audio files in {AUDIO_DIR}: {len(audio_files)}")

    if audio_files:
        print("\n📋 Generated Audio Files:")
        for audio_file in audio_files:
            size = audio_file.stat().st_size
            print(f"    • {audio_file.name} ({size:,} bytes)")

if __name__ == "__main__":
    main()
