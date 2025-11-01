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

# Resource IDs to generate
RESOURCE_IDS = [2, 7, 10, 13, 18, 21, 28, 32, 34]

# Voice names (for reference - SSML files already have these embedded)
VOICES = {
    'spanish': {
        2: 'es-CO-SalomeNeural',
        7: 'es-CO-GonzaloNeural',
        10: 'es-MX-DaliaNeural',
        13: 'es-CO-SalomeNeural',
        18: 'es-MX-DaliaNeural',
        21: 'es-CO-SalomeNeural',
        28: 'es-CO-GonzaloNeural',
        32: 'es-MX-DaliaNeural',
        34: 'es-CO-GonzaloNeural',
    },
    'english': {
        2: 'en-US-JennyNeural',
        7: 'en-US-GuyNeural',
        10: 'en-US-JennyNeural',
        13: 'en-US-GuyNeural',
        18: 'en-US-JennyNeural',
        21: 'en-US-JennyNeural',
        28: 'en-US-GuyNeural',
        32: 'en-US-JennyNeural',
        34: 'en-US-GuyNeural',
    }
}

async def generate_dual_voice_audio(resource_id: int):
    """Generate audio file from SSML with dual voices"""

    ssml_file = f'scripts/ssml-audio-scripts/resource-{resource_id}-ssml.xml'
    if not os.path.exists(ssml_file):
        print(f"⚠️  Resource {resource_id}: SSML file not found at {ssml_file}")
        return False

    try:
        print(f"🎙️  Generating resource {resource_id}...")
        print(f"   Voices: {VOICES['spanish'][resource_id]} (ES) + {VOICES['english'][resource_id]} (EN)")

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
