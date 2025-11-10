#!/usr/bin/env python3
"""
Extract all phrases from a written manual and format for audio script generation.
Converts markdown manual to phrase-only format compatible with generate-all-audio.py

Usage: python extract-all-phrases-from-manual.py <resource_number>
Example: python extract-all-phrases-from-manual.py 1
"""

import re
import sys
import os
from pathlib import Path


def extract_phrases_from_manual(manual_path):
    """
    Extract all phrases from the manual markdown file.
    Returns a list of dictionaries with phrase data.
    """
    with open(manual_path, 'r', encoding='utf-8') as f:
        content = f.read()

    phrases = []

    # Split by phrase headers (### Frase X: ...)
    phrase_blocks = re.split(r'### Frase (\d+):', content)

    # Process pairs (header, content)
    for i in range(1, len(phrase_blocks), 2):
        if i + 1 < len(phrase_blocks):
            phrase_num = phrase_blocks[i].strip()
            phrase_content = phrase_blocks[i + 1]

            # Extract description from the first line after ### Frase X:
            desc_match = re.search(r'^([^\n]+)', phrase_content)
            description = desc_match.group(1).strip() if desc_match else ""

            # Extract English phrase from **English**: section
            english_match = re.search(
                r'\*\*English\*\*:\s*["\']?([^"\'|\n]+)["\']?',
                phrase_content
            )
            english = english_match.group(1).strip() if english_match else ""

            # Extract Spanish from 🗣️ **Español**: section
            spanish_match = re.search(
                r'🗣️\s*\*\*Español\*\*:\s*([^\n]+)',
                phrase_content
            )
            spanish = spanish_match.group(1).strip() if spanish_match else ""

            # Extract tip from 💡 **TIP**: section
            tip_match = re.search(
                r'💡\s*\*\*TIP\*\*:\s*([^│└]+)',
                phrase_content
            )
            tip = tip_match.group(1).strip() if tip_match else ""

            # Clean up tip (remove box characters, trim)
            tip = re.sub(r'[│└─┘┐┌]', '', tip).strip()

            if english:
                phrases.append({
                    'number': phrase_num,
                    'description': description,
                    'english': english,
                    'spanish': spanish,
                    'tip': tip
                })

    return phrases


def format_output(phrases, resource_number):
    """
    Format extracted phrases in the format expected by generate-all-audio.py:

    === PHRASE X: [Description] ===

    [English phrase]

    [English phrase]

    [Spanish phrase]

    [Tip: ...]
    """
    output_lines = []

    for phrase in phrases:
        output_lines.append(f"=== PHRASE {phrase['number']}: {phrase['description']} ===")
        output_lines.append("")
        output_lines.append(phrase['english'])
        output_lines.append("")
        # Duplicate English line for compatibility
        output_lines.append(phrase['english'])
        output_lines.append("")
        output_lines.append(phrase['spanish'])
        output_lines.append("")
        if phrase['tip']:
            output_lines.append(f"Tip: {phrase['tip']}")
        output_lines.append("")

    return "\n".join(output_lines)


def main():
    if len(sys.argv) < 2:
        print("Usage: python extract-all-phrases-from-manual.py <resource_number>")
        print("Example: python extract-all-phrases-from-manual.py 1")
        sys.exit(1)

    resource_num = sys.argv[1]

    # Construct paths
    base_dir = Path(__file__).parent.parent
    manual_path = base_dir / "generated-resources" / "test" / "frases-esenciales-entregas.md"

    output_dir = Path(__file__).parent / "final-phrases-only"
    output_dir.mkdir(parents=True, exist_ok=True)

    output_path = output_dir / f"resource-{resource_num}-COMPLETE.txt"

    # Check if manual exists
    if not manual_path.exists():
        print(f"Error: Manual not found at {manual_path}")
        sys.exit(1)

    print(f"Extracting phrases from: {manual_path}")

    # Extract phrases
    phrases = extract_phrases_from_manual(str(manual_path))
    print(f"Found {len(phrases)} phrases")

    # Format output
    output = format_output(phrases, resource_num)

    # Write to file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output)

    print(f"Phrases written to: {output_path}")
    print(f"\nFirst phrase preview:")
    lines = output.split('\n')[:8]
    for line in lines:
        print(line)


if __name__ == "__main__":
    main()
