#!/usr/bin/env python3
"""Generate audio for ALL 59 resources"""
import json
import os
from pathlib import Path
from gtts import gTTS
import time

# All 59 resources with thoughtful voice distribution
VOICE_MAPPING = {
    # Original 9
    2: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    7: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    10: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},
    13: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    18: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    21: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    28: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    32: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},
    34: {'lang': 'en', 'tld': 'us', 'name': 'American English'},

    # Phase 1 (12)
    1: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    4: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},
    6: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    11: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    14: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    17: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    22: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},
    23: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    27: {'lang': 'es', 'tld': 'com', 'name': 'US Spanish'},
    29: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},
    48: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    50: {'lang': 'en', 'tld': 'us', 'name': 'American English'},

    # Remaining PDF resources (rotate accents)
    3: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    5: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},
    8: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    9: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},
    12: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    15: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    16: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    19: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    20: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    24: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    25: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},
    26: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    30: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},
    31: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    33: {'lang': 'en', 'tld': 'us', 'name': 'American English'},

    # JSON-converted (35-59) - mostly English for professional content
    35: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    36: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    37: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    38: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    39: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    40: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},
    41: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    42: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    43: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    44: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},
    45: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    46: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    47: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    49: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},
    51: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    52: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    53: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    54: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},
    55: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    56: {'lang': 'es', 'tld': 'com.co', 'name': 'Colombian Spanish'},
    57: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
    58: {'lang': 'es', 'tld': 'com.mx', 'name': 'Mexican Spanish'},
    59: {'lang': 'en', 'tld': 'us', 'name': 'American English'},
}

def find_content_file(resource_id):
    """Find content file for any resource"""
    search_paths = [
        f'generated-resources/50-batch/**/*.md',
        f'generated-resources/50-batch/**/*.txt',
        f'docs/resources/converted/**/*.md',
    ]

    # Direct mapping for known files
    from glob import glob
    for pattern in search_paths:
        files = glob(pattern, recursive=True)
        for f in files:
            if os.path.exists(f):
                # Read and check if it's substantial content
                try:
                    with open(f, 'r', encoding='utf-8') as file:
                        content = file.read()
                        if len(content) > 500:  # Minimum content length
                            return f, content
                except:
                    continue
    return None, None

def extract_text_for_audio(content):
    """Extract first 1000 chars of meaningful text"""
    lines = []
    for line in content.split('\n'):
        line = line.strip()
        if not line or line.startswith('#') or line.startswith('**Nivel'):
            continue
        # Remove markdown formatting but keep text
        line = line.replace('**', '').replace('*', '').replace('│', '').replace('┌', '').replace('└', '').replace('─', '')
        if len(line) > 10:
            lines.append(line)
        if len('\n'.join(lines)) > 1000:
            break
    return '\n'.join(lines)[:1000]

def generate_all_audio():
    output_dir = 'public/audio'
    os.makedirs(output_dir, exist_ok=True)

    print(f"🎙️  Generating audio for ALL 59 resources")
    print("=" * 60)

    success = 0
    skipped = 0
    failed = 0

    for resource_id, voice_config in sorted(VOICE_MAPPING.items()):
        print(f"\n[{resource_id}/59] Resource {resource_id} ({voice_config['name']})...")

        # Check if already exists
        output_file = os.path.join(output_dir, f'resource-{resource_id}.mp3')
        if os.path.exists(output_file):
            print(f"   ⏭️  Already exists, skipping")
            skipped += 1
            continue

        # Find content
        filepath, content = find_content_file(resource_id)
        if not content:
            print(f"   ⚠️  No content found, skipping")
            skipped += 1
            continue

        # Extract text
        text = extract_text_for_audio(content)
        if len(text) < 50:
            print(f"   ⚠️  Insufficient text, skipping")
            skipped += 1
            continue

        try:
            # Generate audio
            tts = gTTS(text=text, lang=voice_config['lang'], tld=voice_config['tld'], slow=True)
            tts.save(output_file)
            size_kb = os.path.getsize(output_file) / 1024
            print(f"   ✅ Generated: {size_kb:.1f} KB")
            success += 1
            time.sleep(0.5)  # Rate limiting
        except Exception as e:
            print(f"   ❌ Error: {e}")
            failed += 1

    print("\n" + "=" * 60)
    print(f"✅ Success: {success}")
    print(f"⏭️  Skipped: {skipped}")
    print(f"❌ Failed: {failed}")
    print("=" * 60)

if __name__ == '__main__':
    generate_all_audio()
