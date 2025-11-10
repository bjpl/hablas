#!/usr/bin/env python3
"""
Clean Audio Scripts - Remove ALL Production Markers
Prepares scripts for TTS generation by removing everything students shouldn't hear.
"""

import os
import re
from pathlib import Path

def clean_audio_script(text: str) -> str:
    """
    Remove ALL production markers, timestamps, and metadata.
    Keep ONLY the dialogue that should be spoken.
    """
    lines = text.split('\n')
    cleaned_lines = []

    for line in lines:
        line = line.strip()

        # Skip completely (production markers)
        if not line:
            continue
        if line.startswith('#'):  # Headers, timestamps
            continue
        if line.startswith('**['):  # **[Speaker:], **[Tone:], **[Pause:]
            continue
        if line.startswith('[') and ']' in line:  # [00:00], [Pause:], timestamps
            continue
        if line == '---':  # Dividers
            continue
        if line.startswith('**Total Duration'):
            continue
        if line.startswith('**Target'):
            continue
        if line.startswith('**Language'):
            continue
        if line.startswith('**Level'):
            continue
        if line.startswith('**Category'):
            continue

        # Keep quoted dialogue
        if line.startswith('"') and line.endswith('"'):
            # Remove quotes, keep text
            cleaned_lines.append(line[1:-1])
            cleaned_lines.append('')  # Add pause after dialogue
            continue

        # Keep regular instructional text (but not timestamps)
        if not re.match(r'^\d+:\d+', line):  # Not a timestamp
            cleaned_lines.append(line)

    # Join and clean up
    result = '\n'.join(cleaned_lines)
    # Remove multiple blank lines
    result = re.sub(r'\n{3,}', '\n\n', result)

    return result.strip()

def main():
    # Source directory
    source_dir = Path('public/generated-resources/50-batch')

    # Output directory
    output_dir = Path('scripts/cleaned-audio-scripts')
    output_dir.mkdir(exist_ok=True)

    # Find all audio script files
    audio_scripts = list(source_dir.glob('*/*audio-script.txt'))

    print(f"Found {len(audio_scripts)} audio script files to clean\n")

    for script_path in audio_scripts:
        print(f"Cleaning: {script_path.name}")

        # Read original
        with open(script_path, 'r', encoding='utf-8') as f:
            original = f.read()

        # Clean it
        cleaned = clean_audio_script(original)

        # Save cleaned version
        output_path = output_dir / script_path.name
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(cleaned)

        print(f"  Original: {len(original)} chars")
        print(f"  Cleaned:  {len(cleaned)} chars")
        print(f"  Saved to: {output_path}\n")

    print(f"✅ Cleaned {len(audio_scripts)} scripts")
    print(f"📁 Output: {output_dir}")
    print(f"\nNext: Regenerate audio with: python scripts/generate-audio-edge.py")

if __name__ == '__main__':
    main()
