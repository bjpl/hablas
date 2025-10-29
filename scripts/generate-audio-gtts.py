#!/usr/bin/env python3
"""
Generate audio files using gTTS with Colombian Spanish accents
Matches sinonimos_de_ver pattern but uses free gTTS
"""

import json
import os
import time
from pathlib import Path
from gtts import gTTS

# Voice mapping (gTTS has single voice per language, but we vary the accent)
VOICE_MAPPING = {
    2: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},    # Delivery
    7: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},    # Delivery
    10: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},     # Conversations
    13: {'lang': 'en', 'tld': 'us', 'name': 'American English'},        # Directions
    18: {'lang': 'en', 'tld': 'us', 'name': 'American English'},        # Directions
    21: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},   # Greetings
    28: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},   # Greetings
    32: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},     # Conversations
    34: {'lang': 'en', 'tld': 'us', 'name': 'American English'}         # Dialogues
}

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

    # Join and add spacing for natural speech
    return '\n\n'.join(cleaned_lines)

def read_audio_script(resource_id):
    """Read content from generated-resources audio script files"""
    # Map resource IDs to actual file paths
    file_mapping = {
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

    script_path = file_mapping.get(resource_id)
    if not script_path or not os.path.exists(script_path):
        return None

    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
        return clean_audio_script(content)

def generate_audio(resource_id, voice_config, output_dir):
    """Generate MP3 audio file using gTTS"""

    # Read script content
    text = read_audio_script(resource_id)
    if not text:
        print(f"⚠️  Resource {resource_id}: No script found, skipping")
        return False

    # Generate audio
    try:
        print(f"🎙️  Generating resource {resource_id} ({voice_config['name']})...")

        tts = gTTS(
            text=text,
            lang=voice_config['lang'],
            tld=voice_config['tld'],
            slow=True  # 0.8x speed for beginners
        )

        output_file = os.path.join(output_dir, f'resource-{resource_id}.mp3')
        tts.save(output_file)

        file_size = os.path.getsize(output_file) / 1024  # KB
        print(f"   ✅ Saved: {output_file} ({file_size:.1f} KB)")
        return True

    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def create_metadata(output_dir):
    """Create metadata.json matching sinonimos_de_ver format"""

    metadata = {
        "resources": {},
        "voices": {
            "co_spanish": {
                "name": "es-CO (gTTS)",
                "region": "CO",
                "gender": "neutral",
                "description": "Colombian Spanish accent"
            },
            "mx_spanish": {
                "name": "es-MX (gTTS)",
                "region": "MX",
                "gender": "neutral",
                "description": "Mexican Spanish accent"
            },
            "us_english": {
                "name": "en-US (gTTS)",
                "region": "US",
                "gender": "neutral",
                "description": "American English accent"
            }
        },
        "generatedAt": "2025-10-29"
    }

    # Add resource entries
    for resource_id, voice_config in VOICE_MAPPING.items():
        audio_file = f'/audio/resource-{resource_id}.mp3'

        voice_key = 'co_spanish' if 'com.co' in voice_config['tld'] else \
                    'mx_spanish' if 'com.mx' in voice_config['tld'] else 'us_english'

        metadata['resources'][str(resource_id)] = {
            "file": audio_file,
            "voice": voice_key,
            "accent": voice_config['name']
        }

    # Save metadata
    metadata_file = os.path.join(output_dir, 'metadata.json')
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Metadata saved: {metadata_file}")

def main():
    print("🎙️  Audio Generation with gTTS")
    print("=" * 50)

    # Create output directory
    output_dir = 'public/audio'
    os.makedirs(output_dir, exist_ok=True)

    # Generate audio files (with delay to avoid rate limiting)
    success_count = 0
    for i, (resource_id, voice_config) in enumerate(VOICE_MAPPING.items()):
        if generate_audio(resource_id, voice_config, output_dir):
            success_count += 1

        # Add delay between requests to avoid rate limiting
        if i < len(VOICE_MAPPING) - 1:
            print("   ⏳ Waiting 10 seconds to avoid rate limits...")
            time.sleep(10)

    # Create metadata
    create_metadata(output_dir)

    print("\n" + "=" * 50)
    print(f"✅ Complete! Generated {success_count}/{len(VOICE_MAPPING)} audio files")
    print(f"📁 Location: {output_dir}/")
    print("🎉 Ready to deploy!")

if __name__ == '__main__':
    main()
