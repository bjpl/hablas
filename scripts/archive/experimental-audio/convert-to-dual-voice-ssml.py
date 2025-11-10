#!/usr/bin/env python3
"""
Convert Cleaned Audio Scripts to Dual-Voice SSML

Takes cleaned audio scripts and wraps Spanish/English segments
in appropriate voice tags for native pronunciation.

Spanish content → es-CO-SalomeNeural (Colombian Spanish)
English content → en-US-JennyNeural (American English)
"""

import re
from pathlib import Path

def detect_language(text: str) -> str:
    """
    Detect if text is primarily Spanish or English using word-boundary matching

    Returns: 'spanish', 'english', or 'mixed'
    """
    # Spanish characters are definitive
    spanish_chars = bool(re.search(r'[¿¡áéíóúüñ]', text))
    if spanish_chars:
        return 'spanish'

    # Use word boundaries to match complete words only
    spanish_words = [
        'hola', 'tengo', 'su', 'entrega', 'está', 'dónde',
        'qué', 'cómo', 'puedo', 'favor', 'gracias', 'por',
        'para', 'cuando', 'frase', 'número', 'uno', 'dos',
        'tres', 'cliente', 'pedido', 'siempre', 'usa',
        'confirma', 'importante', 'español'
    ]

    text_lower = text.lower()
    for word in spanish_words:
        pattern = r'\b' + re.escape(word) + r'\b'
        if re.search(pattern, text_lower):
            return 'spanish'

    # English indicators
    english_words = bool(re.search(
        r'\b(delivery|order|customer|address|thank|sorry|problem|wait|here|'
        r'there|where|what|how|your|from|have|michael|chipotle)\b',
        text_lower
    ))

    if english_words:
        return 'english'

    # Default to Spanish for narrator context
    return 'spanish'

def convert_to_ssml(script_text: str, resource_id: int) -> str:
    """
    Convert cleaned script to SSML with dual voices

    Args:
        script_text: Cleaned audio script (no markers)
        resource_id: Resource ID for voice selection

    Returns:
        SSML formatted text with voice tags
    """

    # Voice mapping (match original generate-audio-edge.py)
    voice_mapping = {
        2: {'spanish': 'es-CO-SalomeNeural', 'english': 'en-US-JennyNeural'},
        7: {'spanish': 'es-CO-GonzaloNeural', 'english': 'en-US-GuyNeural'},
        10: {'spanish': 'es-MX-DaliaNeural', 'english': 'en-US-JennyNeural'},
        13: {'spanish': 'es-CO-SalomeNeural', 'english': 'en-US-GuyNeural'},
        18: {'spanish': 'es-MX-DaliaNeural', 'english': 'en-US-JennyNeural'},
        21: {'spanish': 'es-CO-SalomeNeural', 'english': 'en-US-JennyNeural'},
        28: {'spanish': 'es-CO-GonzaloNeural', 'english': 'en-US-GuyNeural'},
        32: {'spanish': 'es-MX-DaliaNeural', 'english': 'en-US-JennyNeural'},
        34: {'spanish': 'es-CO-GonzaloNeural', 'english': 'en-US-GuyNeural'},
    }

    voices = voice_mapping.get(resource_id, {
        'spanish': 'es-CO-SalomeNeural',
        'english': 'en-US-JennyNeural'
    })

    lines = script_text.split('\n')
    ssml_parts = ['<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-CO">']

    current_voice = None

    for line in lines:
        line = line.strip()
        if not line:
            # Add pause for empty lines
            ssml_parts.append('  <break time="500ms"/>')
            continue

        # Detect language of this line
        lang = detect_language(line)

        # Determine which voice to use
        if lang == 'english':
            needed_voice = voices['english']
        else:
            needed_voice = voices['spanish']

        # Switch voice if needed
        if current_voice != needed_voice:
            # Close previous voice tag if exists
            if current_voice:
                ssml_parts.append('  </voice>')
            # Open new voice tag
            ssml_parts.append(f'  <voice name="{needed_voice}">')
            current_voice = needed_voice

        # Add the text (escape XML special chars)
        escaped_line = (line
                       .replace('&', '&amp;')
                       .replace('<', '&lt;')
                       .replace('>', '&gt;')
                       .replace('"', '&quot;'))

        # Add prosody for slower speech (-20% rate)
        ssml_parts.append(f'    <prosody rate="-20%">{escaped_line}</prosody>')

        # Add natural pause after each line
        ssml_parts.append('    <break time="800ms"/>')

    # Close last voice tag
    if current_voice:
        ssml_parts.append('  </voice>')

    ssml_parts.append('</speak>')

    return '\n'.join(ssml_parts)

def main():
    input_dir = Path('scripts/minimal-dialogue-scripts')  # Use MINIMAL dialogue (ONLY phrases)
    output_dir = Path('scripts/ssml-audio-scripts')
    output_dir.mkdir(exist_ok=True)

    # ALL bilingual audio resource IDs (1-37)
    resource_ids = list(range(1, 38))  # Resources 1 through 37

    print("🎙️  Converting Cleaned Scripts to Dual-Voice SSML")
    print("=" * 60)

    for resource_id in resource_ids:
        # Find the cleaned script
        pattern = f'*resource-{resource_id}-clean.txt'
        matches = list(input_dir.glob(pattern))

        # Try alternative naming
        if not matches:
            # Map to original filenames
            script_files = {
                2: 'basic_audio_1-audio-script.txt',
                7: 'basic_audio_2-audio-script.txt',
                10: 'intermediate_conversations_1-audio-script.txt',
                13: 'basic_audio_navigation_1-audio-script.txt',
                18: 'basic_audio_navigation_2-audio-script.txt',
                21: 'basic_greetings_all_1-audio-script.txt',
                28: 'basic_greetings_all_2-audio-script.txt',
                32: 'intermediate_conversations_2-audio-script.txt',
                34: 'intermediate_audio_conversations_1-audio-script.txt',
            }
            script_file = input_dir / script_files.get(resource_id, f'resource-{resource_id}-minimal.txt')
        else:
            script_file = matches[0]

        if not script_file.exists():
            print(f"⚠️  Resource {resource_id}: Script not found at {script_file}")
            continue

        print(f"\n🔄 Resource {resource_id}: {script_file.name}")

        # Read cleaned script
        with open(script_file, 'r', encoding='utf-8') as f:
            cleaned_text = f.read()

        # Convert to SSML
        ssml = convert_to_ssml(cleaned_text, resource_id)

        # Save SSML
        output_file = output_dir / f'resource-{resource_id}-ssml.xml'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(ssml)

        print(f"   Original: {len(cleaned_text)} chars")
        print(f"   SSML:     {len(ssml)} chars")
        print(f"   ✅ Saved: {output_file}")

    print("\n" + "=" * 60)
    print(f"✅ Converted {len(resource_ids)} scripts to SSML")
    print(f"📁 Output: {output_dir}/")
    print("\n🎯 Next: Generate audio with dual voices")
    print("   Run: python scripts/generate-audio-ssml.py")

if __name__ == '__main__':
    main()
