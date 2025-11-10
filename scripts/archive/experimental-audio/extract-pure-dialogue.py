#!/usr/bin/env python3
"""
Extract PURE DIALOGUE Only - Ultra-Clean Audio

For students: They should hear ONLY:
- English phrases to learn (in English voice)
- Spanish translations (in Spanish voice)

NOT narrator instructions, tips, or guidance.
"""

import re
from pathlib import Path

def extract_pure_dialogue(text: str) -> str:
    """
    Extract ONLY dialogue - nothing else

    Keeps:
    - Quoted English phrases: "Hi, I have your delivery"
    - Immediate Spanish translations: "En español: Hola, tengo su entrega"

    Removes:
    - ALL narrator instructions
    - ALL tips and advice
    - ALL metadata
    - ALL section headers
    """
    lines = text.split('\n')
    dialogue_pairs = []

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Look for English dialogue (quoted)
        if line.startswith('"') and line.endswith('"'):
            english = line[1:-1]  # Remove quotes

            # Check if this is English (not Spanish narrator text)
            if re.search(r'\b(delivery|order|customer|address|have|your|here|thank|sorry|please|where|what|can|you)\b', english.lower()):
                # This is an English phrase - keep it
                # Look ahead for Spanish translation
                spanish_trans = None
                for j in range(i+1, min(i+10, len(lines))):
                    next_line = lines[j].strip()
                    if next_line.startswith('"') and 'En español:' in next_line:
                        # Found the translation
                        spanish_trans = next_line[1:-1]  # Remove quotes
                        break
                    elif next_line.startswith('"') and any(c in next_line for c in ['¿', '¡', 'á', 'é', 'í', 'ó', 'ú', 'ñ']):
                        # Found Spanish without "En español:" prefix
                        spanish_trans = next_line[1:-1]
                        break

                # Add the pair
                dialogue_pairs.append({
                    'english': english,
                    'spanish': spanish_trans
                })

        i += 1

    # Build clean script
    result_lines = []

    for pair in dialogue_pairs:
        # English phrase (repeat twice for learning)
        result_lines.append(pair['english'])
        result_lines.append('')  # Pause
        result_lines.append(pair['english'])  # Repeat
        result_lines.append('')  # Pause

        # Spanish translation (if exists)
        if pair['spanish']:
            # Clean up "En español:" prefix
            spanish = pair['spanish'].replace('En español:', '').strip()
            result_lines.append(spanish)
            result_lines.append('')  # Pause

    return '\n'.join(result_lines)

def main():
    input_dir = Path('public/generated-resources/50-batch')
    output_dir = Path('scripts/pure-dialogue-scripts')
    output_dir.mkdir(exist_ok=True)

    # Audio script files
    audio_scripts = list(input_dir.glob('*/*audio-script.txt'))

    print("🎯 Extracting PURE DIALOGUE Only")
    print("=" * 60)
    print("Students will hear: English phrases + Spanish translations")
    print("Students will NOT hear: Instructions, tips, guidance")
    print("=" * 60 + "\n")

    for script_path in audio_scripts:
        print(f"Processing: {script_path.name}")

        # Read original
        with open(script_path, 'r', encoding='utf-8') as f:
            original = f.read()

        # Extract pure dialogue
        pure = extract_pure_dialogue(original)

        # Save
        output_path = output_dir / script_path.name
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(pure)

        phrases = pure.count('\n\n') // 3  # Rough count
        print(f"  Extracted {phrases} phrase pairs")
        print(f"  Original: {len(original)} chars → Pure: {len(pure)} chars")
        print(f"  ✅ Saved: {output_path}\n")

    print("=" * 60)
    print(f"✅ Extracted {len(audio_scripts)} pure dialogue scripts")
    print(f"📁 Output: {output_dir}/")
    print("\n🎯 Next: Generate audio from pure dialogue")
    print("   These will be SHORT, focused, and professional")

if __name__ == '__main__':
    main()
