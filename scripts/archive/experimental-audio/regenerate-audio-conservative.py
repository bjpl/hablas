#!/usr/bin/env python3
"""
ULTRA-CONSERVATIVE Audio Regeneration
Processes ONE file at a time with long delays to avoid rate limits.
Use this script if the batch version still hits rate limits.
"""

import os
import re
from pathlib import Path
from gtts import gTTS
import time
from datetime import datetime

# Base directories
SCRIPTS_DIR = Path("out/generated-resources/50-batch")
AUDIO_DIR = Path("out/audio")

# ULTRA CONSERVATIVE SETTINGS
DELAY_BETWEEN_ATTEMPTS = 60  # 60 seconds (1 minute) between each file
MAX_RETRIES = 3  # Retry failed files up to 3 times
RETRY_DELAY = 120  # 2 minutes wait before retry

def log(message):
    """Log with timestamp."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

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

        # Spanish content (contains Spanish characters)
        if any(char in line for char in ['¿', '¡', 'á', 'é', 'í', 'ó', 'ú', 'ñ']):
            clean_line = line.strip('"').strip("'")
            if len(clean_line) > 10:
                segments['spanish'].append(clean_line)

        # English phrases (in quotes, reasonable length)
        elif line.count('"') >= 2:
            matches = re.findall(r'"([^"]+)"', line)
            for match in matches:
                if 5 < len(match.split()) <= 15:
                    if not any(word in match.lower() for word in ['audio', 'script', 'production', 'narrator']):
                        segments['english'].append(match)

    return segments

def generate_audio_safe(text: str, lang: str, output_path: Path, retries: int = 3) -> bool:
    """Generate audio with retry logic."""
    for attempt in range(retries):
        try:
            log(f"   Generating {output_path.name} (attempt {attempt + 1}/{retries})")

            audio = gTTS(text=text, lang=lang, slow=True)
            audio.save(str(output_path))

            file_size = output_path.stat().st_size

            if file_size > 1000:  # Minimum 1KB for valid audio
                log(f"   ✅ SUCCESS: {file_size:,} bytes, {len(text)} chars")
                return True
            else:
                log(f"   ⚠️  File too small ({file_size} bytes), retrying...")
                output_path.unlink()  # Delete invalid file

        except Exception as e:
            error_str = str(e)
            log(f"   ❌ Attempt {attempt + 1} failed: {error_str}")

            if "429" in error_str or "Too Many Requests" in error_str:
                if attempt < retries - 1:
                    log(f"   ⏸️  Rate limited. Waiting {RETRY_DELAY}s before retry...")
                    time.sleep(RETRY_DELAY)
            elif attempt < retries - 1:
                log(f"   ⏸️  Waiting 30s before retry...")
                time.sleep(30)

    return False

def process_single_file(script_file: Path, category: str, file_num: int, total: int) -> dict:
    """Process one script file with maximum caution."""
    result = {'success': False, 'files_generated': 0, 'skipped': False}

    script_name = script_file.stem.replace('-audio-script', '')

    log("")
    log("=" * 70)
    log(f"📄 FILE {file_num}/{total}: [{category}] {script_file.name}")
    log("=" * 70)

    try:
        # Read and extract content
        content = script_file.read_text(encoding='utf-8')
        segments = extract_script_content(content)

        spanish_count = len(segments.get('spanish', []))
        english_count = len(segments.get('english', []))

        log(f"📝 Extracted: {spanish_count} Spanish + {english_count} English segments")

        if spanish_count == 0 and english_count == 0:
            log("⚠️  No content found - SKIPPING")
            result['skipped'] = True
            return result

        audio_name = f"{category}_{script_name}"

        # Generate Spanish audio
        if spanish_count > 0:
            spanish_text = '. '.join(segments['spanish'])
            spanish_path = AUDIO_DIR / f"{audio_name}-es.mp3"

            # Check if file already exists and is valid
            if spanish_path.exists() and spanish_path.stat().st_size > 1000:
                log(f"   ✓ Spanish file already exists ({spanish_path.stat().st_size:,} bytes)")
                result['files_generated'] += 1
            else:
                log(f"   🎵 Generating Spanish audio ({len(spanish_text)} chars)...")
                if generate_audio_safe(spanish_text, 'es', spanish_path, MAX_RETRIES):
                    result['files_generated'] += 1
                else:
                    log("   ❌ Spanish audio generation FAILED")

        # Generate English audio (if segments exist)
        if english_count > 0:
            english_text = '. '.join(segments['english'])
            english_path = AUDIO_DIR / f"{audio_name}-en.mp3"

            # Check if file already exists and is valid
            if english_path.exists() and english_path.stat().st_size > 1000:
                log(f"   ✓ English file already exists ({english_path.stat().st_size:,} bytes)")
                result['files_generated'] += 1
            else:
                log(f"   🎵 Generating English audio ({len(english_text)} chars)...")
                if generate_audio_safe(english_text, 'en', english_path, MAX_RETRIES):
                    result['files_generated'] += 1
                else:
                    log("   ❌ English audio generation FAILED")

        result['success'] = result['files_generated'] > 0

    except Exception as e:
        log(f"❌ ERROR processing file: {e}")
        return result

    return result

def main():
    """Main execution - ultra conservative processing."""
    log("🎯 ULTRA-CONSERVATIVE AUDIO REGENERATION")
    log("=" * 70)
    log(f"⚙️  Delay between files: {DELAY_BETWEEN_ATTEMPTS}s (1 minute)")
    log(f"⚙️  Max retries per file: {MAX_RETRIES}")
    log(f"⚙️  Retry delay: {RETRY_DELAY}s (2 minutes)")
    log("=" * 70)
    log("")
    log("This will take approximately 10-15 minutes for 9 files.")
    log("Each file is processed carefully to avoid rate limits.")
    log("")

    # Ensure audio directory exists
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    # Find all script files
    if not SCRIPTS_DIR.exists():
        log(f"❌ Scripts directory not found: {SCRIPTS_DIR}")
        return

    script_files = sorted(SCRIPTS_DIR.rglob("*-audio-script.txt"))
    total_files = len(script_files)

    log(f"📚 Found {total_files} script files to process")

    # Process each file individually
    success_count = 0
    error_count = 0
    skipped_count = 0
    files_generated = 0

    start_time = datetime.now()

    for idx, script_file in enumerate(script_files, 1):
        rel_path = script_file.relative_to(SCRIPTS_DIR)
        category = rel_path.parent.name

        result = process_single_file(script_file, category, idx, total_files)

        if result['success']:
            success_count += 1
            files_generated += result['files_generated']
        elif result['skipped']:
            skipped_count += 1
        else:
            error_count += 1

        # Wait before next file (except after last file)
        if idx < total_files:
            log(f"\n⏸️  Waiting {DELAY_BETWEEN_ATTEMPTS}s before next file...")
            log(f"   Progress: {idx}/{total_files} files processed")
            log(f"   Success: {success_count}, Errors: {error_count}, Skipped: {skipped_count}")
            time.sleep(DELAY_BETWEEN_ATTEMPTS)

    # Final summary
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()

    log("")
    log("=" * 70)
    log("✨ PROCESSING COMPLETE")
    log("=" * 70)
    log(f"✅ Successfully processed: {success_count}/{total_files} scripts")
    log(f"❌ Errors: {error_count}")
    log(f"⏭️  Skipped: {skipped_count}")
    log(f"🎵 Audio files generated: {files_generated}")
    log(f"⏱️  Total time: {int(duration // 60)}m {int(duration % 60)}s")

    # List generated files
    audio_files = sorted(AUDIO_DIR.glob("*.mp3"))
    valid_files = [f for f in audio_files if f.stat().st_size > 1000]
    total_size = sum(f.stat().st_size for f in valid_files)

    log("")
    log(f"📁 Total audio files: {len(valid_files)} valid files")
    log(f"💾 Total size: {total_size / (1024*1024):.2f} MB")

    # Show newly generated files
    log("")
    log("📋 Newly Generated Files:")
    new_files = [f for f in audio_files if any(cat in f.name for cat in ['all_', 'conductor_', 'repartidor_'])]
    for f in sorted(new_files):
        if f.stat().st_size > 1000:
            log(f"   ✓ {f.name} ({f.stat().st_size:,} bytes)")

if __name__ == "__main__":
    main()
