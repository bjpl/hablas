#!/usr/bin/env python3
"""
Export cleaned audio scripts (without production directions)
These can be used for audio regeneration when API limits allow
"""

import os

def clean_audio_script(text):
    """Clean audio script - remove production directions and formatting"""
    cleaned_lines = []

    for line in text.split('\n'):
        trimmed = line.strip()

        # Skip production directions and metadata
        if trimmed.startswith('**['):  # [Speaker:], [Tone:], [Pause:], etc
            continue
        if trimmed.startswith('## ['):  # Timestamps
            continue
        if trimmed.startswith('### ['):  # Section timestamps
            continue
        if trimmed.startswith('**Total Duration'):
            continue
        if trimmed.startswith('**Target'):
            continue
        if trimmed.startswith('**Language'):
            continue
        if trimmed == '---':  # Dividers
            continue
        if trimmed.startswith('# '):  # Section headers
            continue

        # Keep actual content (dialogue in quotes)
        if trimmed:
            cleaned_lines.append(trimmed)

    return '\n\n'.join(cleaned_lines)

# Audio script file mappings
AUDIO_SCRIPTS = {
    2: 'public/generated-resources/50-batch/repartidor/basic_audio_1-audio-script.txt',
    7: 'public/generated-resources/50-batch/repartidor/basic_audio_2-audio-script.txt',
    10: 'public/generated-resources/50-batch/repartidor/intermediate_conversations_1-audio-script.txt',
    13: 'public/generated-resources/50-batch/conductor/basic_audio_navigation_1-audio-script.txt',
    18: 'public/generated-resources/50-batch/conductor/basic_audio_navigation_2-audio-script.txt',
    21: 'public/generated-resources/50-batch/all/basic_greetings_all_1-audio-script.txt',
    28: 'public/generated-resources/50-batch/all/basic_greetings_all_2-audio-script.txt',
    32: 'public/generated-resources/50-batch/repartidor/intermediate_conversations_2-audio-script.txt',
    34: 'public/generated-resources/50-batch/conductor/intermediate_audio_conversations_1-audio-script.txt',
}

def main():
    output_dir = 'scripts/cleaned-audio-scripts'
    os.makedirs(output_dir, exist_ok=True)

    print("📝 Exporting Cleaned Audio Scripts")
    print("=" * 50)

    for resource_id, script_path in AUDIO_SCRIPTS.items():
        if not os.path.exists(script_path):
            print(f"⚠️  Resource {resource_id}: Script not found")
            continue

        with open(script_path, 'r', encoding='utf-8') as f:
            raw_content = f.read()

        cleaned_content = clean_audio_script(raw_content)

        output_file = os.path.join(output_dir, f'resource-{resource_id}-clean.txt')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(cleaned_content)

        print(f"✅ Resource {resource_id}: {len(cleaned_content)} chars → {output_file}")

    print("\n" + "=" * 50)
    print(f"✅ Exported {len(AUDIO_SCRIPTS)} cleaned scripts")
    print(f"📁 Location: {output_dir}/")
    print("\n💡 Use these cleaned scripts for TTS generation when API limits allow")
    print("   Run: python scripts/generate-audio-gtts.py (waits for rate limits to clear)")

if __name__ == '__main__':
    main()
