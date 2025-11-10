#!/usr/bin/env python3
"""
Batch audio regeneration with proper rate limiting.
Processes files in small batches to avoid API rate limits.
"""

import os
import re
import sys
from pathlib import Path
from gtts import gTTS
import time

# Import extraction functions from main script
sys.path.insert(0, str(Path(__file__).parent))

# Base directories
SCRIPTS_DIR = Path("out/generated-resources/50-batch")
AUDIO_DIR = Path("out/audio")

# Configuration
BATCH_SIZE = 3  # Process 3 files at a time
DELAY_BETWEEN_FILES = 5  # 5 seconds between files
DELAY_BETWEEN_BATCHES = 30  # 30 seconds between batches

def extract_script_content(script_content: str) -> dict:
    """Extract Spanish and English content from production scripts."""
    segments = {'spanish': [], 'english': []}
    lines = script_content.split('\n')

    for line in lines:
        line = line.strip()

        # Skip empty lines, comments, headers, stage directions
        if not line:
            continue
        if line.startswith(('#', '---', '```', '[', '*', '###', '//')):
            continue
        if line.startswith('##'):
            continue

        # Skip production notes and timing markers
        skip_markers = ['[pause:', '[tone:', '[speaker:', '[phonetic:',
                       '[english', '[spanish', 'duration:', 'target:', 'focus:',
                       '[end:', 'complete audio script']
        if any(marker in line.lower() for marker in skip_markers):
            continue

        # Clean up quotes
        line = line.strip('"').strip("'")

        # Spanish content (contains Spanish characters)
        if any(char in line for char in ['¿', '¡', 'á', 'é', 'í', 'ó', 'ú', 'ñ']):
            clean_line = line.strip('"').strip("'")
            if len(clean_line) > 10:  # Skip very short fragments
                segments['spanish'].append(clean_line)

        # English phrases (in quotes, reasonable length)
        elif line.count('"') >= 2:
            # Extract text between quotes
            matches = re.findall(r'"([^"]+)"', line)
            for match in matches:
                if 5 < len(match.split()) <= 15:  # Reasonable phrase length
                    if not any(word in match.lower() for word in ['audio', 'script', 'production', 'narrator']):
                        segments['english'].append(match)

    return segments

def generate_audio_file(text: str, lang: str, output_path: Path, description: str) -> bool:
    """Generate a single audio file with error handling."""
    try:
        if len(text) < 20:
            print(f"    ⚠️  Skipping {description}: text too short ({len(text)} chars)")
            return False

        audio = gTTS(text=text, lang=lang, slow=True)
        audio.save(str(output_path))

        file_size = output_path.stat().st_size
        segment_count = len(text.split('. '))
        print(f"    ✅ {description}: {output_path.name}")
        print(f"       ({file_size:,} bytes, {len(text)} chars, {segment_count} segments)")

        return True

    except Exception as e:
        print(f"    ❌ Error generating {description}: {e}")
        return False

def process_script_file(script_file: Path, category: str) -> dict:
    """Process a single script file and generate audio."""
    result = {'success': False, 'files_generated': 0, 'error': None}

    try:
        script_name = script_file.stem.replace('-audio-script', '')
        print(f"\n🎭 [{category}] {script_file.name}")

        # Read and extract content
        content = script_file.read_text(encoding='utf-8')
        segments = extract_script_content(content)

        spanish_count = len(segments.get('spanish', []))
        english_count = len(segments.get('english', []))
        print(f"    📝 Extracted: {spanish_count} Spanish + {english_count} English segments")

        if spanish_count == 0 and english_count == 0:
            result['error'] = 'No content extracted'
            return result

        audio_name = f"{category}_{script_name}"

        # Generate Spanish audio
        if spanish_count > 0:
            spanish_text = '. '.join(segments['spanish'])
            spanish_path = AUDIO_DIR / f"{audio_name}-es.mp3"
            if generate_audio_file(spanish_text, 'es', spanish_path, 'Spanish audio'):
                result['files_generated'] += 1
                time.sleep(DELAY_BETWEEN_FILES)

        # Generate English audio
        if english_count > 0:
            english_text = '. '.join(segments['english'])
            english_path = AUDIO_DIR / f"{audio_name}-en.mp3"
            if generate_audio_file(english_text, 'en', english_path, 'English audio'):
                result['files_generated'] += 1
                time.sleep(DELAY_BETWEEN_FILES)

        result['success'] = result['files_generated'] > 0

    except Exception as e:
        result['error'] = str(e)
        print(f"    ❌ Error processing file: {e}")

    return result

def main():
    """Main execution with batch processing."""
    print("🎯 BATCH AUDIO REGENERATION WITH RATE LIMITING")
    print("=" * 70)
    print(f"⚙️  Config: Batch size={BATCH_SIZE}, Delay between files={DELAY_BETWEEN_FILES}s")
    print(f"⚙️  Config: Delay between batches={DELAY_BETWEEN_BATCHES}s")
    print("=" * 70)

    # Ensure audio directory exists
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    # Find all script files
    if not SCRIPTS_DIR.exists():
        print(f"❌ Scripts directory not found: {SCRIPTS_DIR}")
        return

    script_files = sorted(SCRIPTS_DIR.rglob("*-audio-script.txt"))
    total_files = len(script_files)

    print(f"\n📚 Found {total_files} script files to process")

    # Process in batches
    success_count = 0
    error_count = 0
    files_generated = 0

    for batch_num, i in enumerate(range(0, total_files, BATCH_SIZE), 1):
        batch = script_files[i:i + BATCH_SIZE]

        print(f"\n{'='*70}")
        print(f"📦 BATCH {batch_num}/{(total_files + BATCH_SIZE - 1) // BATCH_SIZE}")
        print(f"   Processing files {i+1}-{min(i+BATCH_SIZE, total_files)} of {total_files}")
        print(f"{'='*70}")

        for script_file in batch:
            rel_path = script_file.relative_to(SCRIPTS_DIR)
            category = rel_path.parent.name

            result = process_script_file(script_file, category)

            if result['success']:
                success_count += 1
                files_generated += result['files_generated']
            else:
                error_count += 1

        # Delay between batches (except after last batch)
        if i + BATCH_SIZE < total_files:
            print(f"\n⏸️  Waiting {DELAY_BETWEEN_BATCHES}s before next batch...")
            time.sleep(DELAY_BETWEEN_BATCHES)

    # Final summary
    print("\n" + "=" * 70)
    print("✨ BATCH PROCESSING COMPLETE")
    print("=" * 70)
    print(f"✅ Successfully processed: {success_count}/{total_files} scripts")
    print(f"❌ Errors: {error_count}")
    print(f"🎵 Audio files generated: {files_generated}")

    # List all audio files
    audio_files = sorted(AUDIO_DIR.glob("*.mp3"))
    total_size = sum(f.stat().st_size for f in audio_files)

    print(f"\n📁 Total audio files: {len(audio_files)}")
    print(f"💾 Total size: {total_size / (1024*1024):.2f} MB")

if __name__ == "__main__":
    main()
