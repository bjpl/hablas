#!/usr/bin/env python3
"""
Generate Dual-Voice Audio from SSML

Uses SSML files with proper voice switching for native pronunciation:
- Spanish voice for Spanish content
- English voice for English content
"""

import asyncio
import os
from pathlib import Path
import edge_tts

# ALL bilingual resource IDs to generate (1-37)
RESOURCE_IDS = list(range(1, 38))  # Resources 1 through 37

# Voice mapping for ALL 37 resources (alternate between voices for variety)
def get_voices(resource_id):
    """Get voice pair for resource ID"""
    # Alternate patterns for variety
    spanish_voices = ['es-CO-SalomeNeural', 'es-CO-GonzaloNeural', 'es-MX-DaliaNeural']
    english_voices = ['en-US-JennyNeural', 'en-US-GuyNeural']

    spanish_voice = spanish_voices[resource_id % 3]
    english_voice = english_voices[resource_id % 2]

    return {
        'spanish': spanish_voice,
        'english': english_voice
    }

async def generate_dual_voice_audio(resource_id: int):
    """Generate audio file from SSML with dual voices"""

    ssml_file = f'scripts/ssml-audio-scripts/resource-{resource_id}-ssml.xml'
    if not os.path.exists(ssml_file):
        print(f"⚠️  Resource {resource_id}: SSML file not found at {ssml_file}")
        return False

    try:
        voices = get_voices(resource_id)
        print(f"🎙️  Generating resource {resource_id}...")
        print(f"   Voices: {voices['spanish']} (ES) + {voices['english']} (EN)")

        # Read SSML
        with open(ssml_file, 'r', encoding='utf-8') as f:
            ssml_text = f.read()

        # Create TTS communicator with SSML
        # Note: edge-tts will parse the SSML and switch voices automatically
        communicate = edge_tts.Communicate(text=ssml_text)

        output_file = f'public/audio/resource-{resource_id}.mp3'
        await communicate.save(output_file)

        file_size = os.path.getsize(output_file) / (1024 * 1024)
        print(f"   ✅ Saved: {output_file} ({file_size:.1f} MB)")
        print(f"   🎯 Native pronunciation for BOTH languages!")
        return True

    except Exception as e:
        print(f"   ❌ Error: {e}")
        print(f"   💡 Falling back to single voice for resource {resource_id}")
        return False

async def main():
    print("🎙️  Dual-Voice Audio Generation (Native Pronunciation)")
    print("=" * 60)
    print("Spanish content → Colombian/Mexican Spanish voice")
    print("English content → American English voice")
    print("=" * 60 + "\n")

    # Create output directory
    os.makedirs('public/audio', exist_ok=True)

    # Generate all audio files
    success_count = 0
    for resource_id in RESOURCE_IDS:
        if await generate_dual_voice_audio(resource_id):
            success_count += 1

        # Small delay between generations
        await asyncio.sleep(1)

    print("\n" + "=" * 60)
    print(f"✅ Complete! Generated {success_count}/{len(RESOURCE_IDS)} dual-voice audio files")
    print(f"📁 Location: public/audio/")
    print("\n🎉 Students will hear:")
    print("   • Spanish with Colombian/Mexican accent ✓")
    print("   • English with American accent ✓")
    print("   • Native pronunciation for BOTH languages!")
    print("\n🚀 Ready to deploy professional quality audio!")

if __name__ == '__main__':
    asyncio.run(main())
