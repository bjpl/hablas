#!/usr/bin/env python3
"""
Generate audio files using edge-tts (Microsoft Edge TTS)
No rate limits, high quality voices with Colombian/Mexican accents
"""

import asyncio
import os
from pathlib import Path
import edge_tts

# Voice mapping with edge-tts voices
VOICE_MAPPING = {
    2: {'voice': 'es-CO-SalomeNeural', 'name': 'Colombian Spanish (Salome)', 'rate': '-20%'},
    7: {'voice': 'es-CO-GonzaloNeural', 'name': 'Colombian Spanish (Gonzalo)', 'rate': '-20%'},
    10: {'voice': 'es-MX-DaliaNeural', 'name': 'Mexican Spanish (Dalia)', 'rate': '-20%'},
    13: {'voice': 'en-US-GuyNeural', 'name': 'American English (Guy)', 'rate': '-20%'},
    18: {'voice': 'en-US-JennyNeural', 'name': 'American English (Jenny)', 'rate': '-20%'},
    21: {'voice': 'es-CO-SalomeNeural', 'name': 'Colombian Spanish (Salome)', 'rate': '-20%'},
    28: {'voice': 'es-CO-GonzaloNeural', 'name': 'Colombian Spanish (Gonzalo)', 'rate': '-20%'},
    32: {'voice': 'es-MX-DaliaNeural', 'name': 'Mexican Spanish (Dalia)', 'rate': '-20%'},
    34: {'voice': 'en-US-GuyNeural', 'name': 'American English (Guy)', 'rate': '-20%'},
}

async def generate_audio(resource_id, config):
    """Generate audio file using edge-tts"""

    # Read cleaned script
    script_file = f'scripts/cleaned-audio-scripts/resource-{resource_id}-clean.txt'
    if not os.path.exists(script_file):
        print(f"⚠️  Resource {resource_id}: No cleaned script found")
        return False

    with open(script_file, 'r', encoding='utf-8') as f:
        text = f.read()

    try:
        print(f"🎙️  Generating resource {resource_id} ({config['name']})...")

        # Create TTS communicator
        communicate = edge_tts.Communicate(
            text=text,
            voice=config['voice'],
            rate=config['rate']  # -20% slower for learners
        )

        output_file = f'public/audio/resource-{resource_id}.mp3'
        await communicate.save(output_file)

        file_size = os.path.getsize(output_file) / 1024
        print(f"   ✅ Saved: {output_file} ({file_size:.1f} KB)")
        return True

    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

async def main():
    print("🎙️  Audio Generation with Microsoft Edge TTS")
    print("=" * 50)

    # Create output directory
    os.makedirs('public/audio', exist_ok=True)

    # Generate all audio files
    success_count = 0
    for resource_id, config in VOICE_MAPPING.items():
        if await generate_audio(resource_id, config):
            success_count += 1

        # Small delay to be polite
        await asyncio.sleep(1)

    print("\n" + "=" * 50)
    print(f"✅ Complete! Generated {success_count}/{len(VOICE_MAPPING)} audio files")
    print(f"📁 Location: public/audio/")
    print("🎉 Ready to deploy!")

if __name__ == '__main__':
    asyncio.run(main())
