#!/usr/bin/env python3
"""
Generate Complete Audio Script from Manual
Extracts all 30 phrases from a manual file and creates properly formatted audio script
"""

import re
import os
import sys


def clean_text(text):
    """Remove box drawing characters and clean text"""
    # Remove box drawing characters
    box_chars = ['│', '└', '─', '┘', '┌', '┐', '├', '┤', '┬', '┴', '┼']
    for char in box_chars:
        text = text.replace(char, '')

    # Clean up extra spaces and newlines
    text = ' '.join(text.split())
    return text.strip()


def extract_phrases_from_manual(manual_path):
    """Extract all phrases from the manual file"""

    if not os.path.exists(manual_path):
        print(f"Error: Manual file not found at {manual_path}")
        sys.exit(1)

    with open(manual_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract metadata from header
    level_match = re.search(r'\*\*Level\*\*:\s*(.+)', content)
    category_match = re.search(r'\*\*Category\*\*:\s*(.+)', content)

    level = level_match.group(1).strip() if level_match else 'Básico'
    category = category_match.group(1).strip() if category_match else 'Repartidor'

    phrases = []

    # Split content into phrase sections
    # Look for pattern: ### 🔢 Phrase X: Description
    phrase_sections = re.split(r'###\s*🔢\s*Phrase\s+(\d+):\s*(.+?)(?=\n)', content)

    # Process sections in groups of 3 (separator, number, description, content)
    for i in range(1, len(phrase_sections), 3):
        if i + 2 > len(phrase_sections):
            break

        phrase_num = phrase_sections[i].strip()
        description = phrase_sections[i + 1].strip()
        phrase_content = phrase_sections[i + 2]

        # Extract English text
        english_match = re.search(r'\*\*English\*\*:\s*["""](.+?)["""]', phrase_content)
        english = english_match.group(1).strip() if english_match else ''

        # Extract Spanish text - look for 🗣️ **Español**: pattern
        spanish_match = re.search(r'🗣️\s*\*\*Español\*\*:\s*["""]?(.+?)["""]?(?:\n|$)', phrase_content)
        spanish = spanish_match.group(1).strip() if spanish_match else ''

        # Clean Spanish text from any markdown or extra characters
        spanish = re.sub(r'\*\*.*?\*\*', '', spanish)  # Remove bold markers
        spanish = spanish.strip('"').strip()

        # Extract tip text - look for 💡 **TIP**: pattern
        tip_match = re.search(r'💡\s*\*\*TIP\*\*:\s*(.+?)(?=\n#{2,}|\n\*\*|$)', phrase_content, re.DOTALL)
        tip = ''
        if tip_match:
            tip_text = tip_match.group(1).strip()
            # Clean box characters and extra whitespace
            tip = clean_text(tip_text)
            # Remove any remaining markdown
            tip = re.sub(r'\*\*.*?\*\*', '', tip)
            tip = tip.strip()

        if english and spanish:
            phrases.append({
                'number': int(phrase_num),
                'description': description,
                'english': english,
                'spanish': spanish,
                'tip': tip
            })

    return phrases, level, category


def generate_audio_script(phrases, level, category, output_path, resource_num=1):
    """Generate the complete audio script in the required format"""

    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Calculate duration (approximately 24 seconds per phrase)
    duration_minutes = (len(phrases) * 24) // 60

    # Build the script content
    lines = []

    # Add header
    lines.append(f"# Resource {resource_num}: Essential Delivery Phrases - COMPLETE ({len(phrases)} phrases)")
    lines.append(f"**Level**: {level}")
    lines.append(f"**Category**: {category}")
    lines.append(f"**Duration**: ~{duration_minutes} minutes ({len(phrases)} phrases)")
    lines.append(f"**Phrases**: {len(phrases)} complete phrases")
    lines.append("")
    lines.append("")

    # Add each phrase
    for phrase in sorted(phrases, key=lambda x: x['number']):
        lines.append(f"=== PHRASE {phrase['number']}: {phrase['description']} ===")
        lines.append("")
        lines.append(phrase['english'])
        lines.append("")
        lines.append(phrase['english'])  # Duplicate for filter
        lines.append("")
        lines.append(phrase['spanish'])
        lines.append("")

        if phrase['tip']:
            lines.append(f"Tip: {phrase['tip']}")
        else:
            lines.append("Tip: Practice this phrase in different contexts.")

        lines.append("")
        lines.append("")

    # Write to file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    return len(phrases)


def main():
    """Main execution function"""

    # Get script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)

    # Default paths
    default_manual = os.path.join(
        project_root,
        'public',
        'generated-resources',
        '50-batch',
        'repartidor',
        'basic_phrases_1.md'
    )

    default_output = os.path.join(
        script_dir,
        'final-phrases-only',
        'resource-1.txt'
    )

    # Get paths from command line or use defaults
    manual_path = sys.argv[1] if len(sys.argv) > 1 else default_manual
    output_path = sys.argv[2] if len(sys.argv) > 2 else default_output
    resource_num = int(sys.argv[3]) if len(sys.argv) > 3 else 1

    print(f"Processing manual: {manual_path}")
    print(f"Output will be: {output_path}")
    print("")

    # Extract phrases
    print("Extracting phrases from manual...")
    phrases, level, category = extract_phrases_from_manual(manual_path)

    print(f"Found {len(phrases)} phrases")
    print(f"Level: {level}")
    print(f"Category: {category}")
    print("")

    # Verify we have all 30 phrases
    expected_phrases = 30
    if len(phrases) < expected_phrases:
        print(f"WARNING: Only found {len(phrases)} phrases, expected {expected_phrases}")
        missing = set(range(1, expected_phrases + 1)) - {p['number'] for p in phrases}
        if missing:
            print(f"Missing phrase numbers: {sorted(missing)}")

    # Generate script
    print("Generating audio script...")
    phrase_count = generate_audio_script(phrases, level, category, output_path, resource_num)

    print(f"Successfully generated script with {phrase_count} phrases")
    print(f"Script saved to: {output_path}")
    print("")
    print("Preview of first phrase:")
    if phrases:
        first = phrases[0]
        print(f"  Phrase {first['number']}: {first['description']}")
        print(f"  English: {first['english']}")
        print(f"  Spanish: {first['spanish']}")
        if first['tip']:
            print(f"  Tip: {first['tip'][:80]}...")

    return 0


if __name__ == '__main__':
    sys.exit(main())
