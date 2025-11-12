#!/usr/bin/env python3
"""
Generate Dual-Voice Audio for ALL 19 Aligned Resources (+ 2 Pending)
Uses edge-tts (Microsoft Edge TTS) with correct file path mapping

Currently Supports: 19 resources (9 from 50-batch + 10 from audio-scripts)
Pending: 2 visual resources (awaiting resource ID assignment)

USAGE:
    python scripts/generate-aligned-audio.py --all
    python scripts/generate-aligned-audio.py --resources 2,5,7
    python scripts/generate-aligned-audio.py --group 1  (resources 2,7,10,13,18,21,28,32,34)
    python scripts/generate-aligned-audio.py --group 2  (resources 5,31,45-52)
"""

import os
import sys
import argparse

# Add ffmpeg to PATH BEFORE importing pydub
os.environ['PATH'] = r'C:\ffmpeg\bin' + os.pathsep + os.environ.get('PATH', '')

import asyncio
import re
from pathlib import Path
from pydub import AudioSegment
import edge_tts

# ============================================================================
# RESOURCE MAPPING - 19 ALIGNED RESOURCES
# ============================================================================
# Total: 19 resources mapped (9 Group 1 + 10 Group 2)
# Pending: 2 visual resources awaiting resource ID assignment

RESOURCE_PATHS = {
    # Group 1: Cleaned audio scripts from 50-batch (9 resources)
    2: 'public/generated-resources/50-batch/repartidor/basic_audio_1-audio-script.txt',
    7: 'public/generated-resources/50-batch/repartidor/basic_audio_2-audio-script.txt',
    10: 'public/generated-resources/50-batch/repartidor/intermediate_conversations_1-audio-script.txt',
    32: 'public/generated-resources/50-batch/repartidor/intermediate_conversations_2-audio-script.txt',
    13: 'public/generated-resources/50-batch/conductor/basic_audio_navigation_1-audio-script.txt',
    18: 'public/generated-resources/50-batch/conductor/basic_audio_navigation_2-audio-script.txt',
    34: 'public/generated-resources/50-batch/conductor/intermediate_audio_conversations_1-audio-script.txt',
    21: 'public/generated-resources/50-batch/all/basic_greetings_all_1-audio-script.txt',
    28: 'public/generated-resources/50-batch/all/basic_greetings_all_2-audio-script.txt',

    # Group 2: New audio scripts (10 resources)
    5: 'public/audio-scripts/intermediate_situations_1-audio-script.txt',
    31: 'public/audio-scripts/intermediate_situations_2-audio-script.txt',
    45: 'public/audio-scripts/accident-procedures-audio-script.txt',
    46: 'public/audio-scripts/customer-conflict-audio-script.txt',
    47: 'public/audio-scripts/lost-or-found-items-audio-script.txt',
    48: 'public/audio-scripts/medical-emergencies-audio-script.txt',
    49: 'public/audio-scripts/payment-disputes-audio-script.txt',
    50: 'public/audio-scripts/safety-concerns-audio-script.txt',
    51: 'public/audio-scripts/vehicle-breakdown-audio-script.txt',
    52: 'public/audio-scripts/weather-hazards-audio-script.txt',

    # Pending expansion: 2 visual resources (files exist, awaiting resource IDs)
    # XX: 'public/audio-scripts/basic_visual_1-audio-script.txt',  # Pending resource ID assignment
    # XX: 'public/audio-scripts/basic_visual_2-audio-script.txt',  # Pending resource ID assignment
}

# Total resources: 19 (+ 2 pending visual resources)

# Voice configuration - Uses existing edge-tts system
def get_voices_for_resource(resource_id: int) -> tuple:
    """
    Assign appropriate Spanish/English voices based on resource ID
    Uses Colombian Spanish and American English for consistency
    """
    # Known voice assignments (from existing system)
    known_voices = {
        2: ('es-CO-SalomeNeural', 'en-US-JennyNeural'),
        7: ('es-CO-GonzaloNeural', 'en-US-GuyNeural'),
        10: ('es-CO-SalomeNeural', 'en-US-JennyNeural'),
        13: ('es-CO-SalomeNeural', 'en-US-GuyNeural'),
        18: ('es-CO-GonzaloNeural', 'en-US-JennyNeural'),
        21: ('es-CO-SalomeNeural', 'en-US-JennyNeural'),
        28: ('es-CO-GonzaloNeural', 'en-US-GuyNeural'),
        32: ('es-CO-SalomeNeural', 'en-US-JennyNeural'),
        34: ('es-CO-GonzaloNeural', 'en-US-GuyNeural'),
    }

    if resource_id in known_voices:
        return known_voices[resource_id]

    # Alternate between female/male for variety (Group 2 resources)
    # Female resources: 5, 45, 47, 49, 51
    # Male resources: 31, 46, 48, 50, 52
    is_female = (resource_id % 2) == 1

    if is_female:
        spanish = 'es-CO-SalomeNeural'
        english = 'en-US-JennyNeural'
    else:
        spanish = 'es-CO-GonzaloNeural'
        english = 'en-US-GuyNeural'

    return (spanish, english)

def detect_language(text: str) -> str:
    """Detect if text is Spanish or English using word-boundary matching"""
    # Spanish characters are definitive
    if re.search(r'[¿¡áéíóúüñ]', text):
        return 'spanish'

    # Use word boundaries to match complete words only
    spanish_words = [
        'hola', 'tengo', 'su', 'entrega', 'español', 'gracias',
        'día', 'gran', 'está', 'estoy', 'puede', 'quiere',
        'necesito', 'disculpe', 'por favor', 'buenos', 'buenas',
        'cómo', 'dónde', 'cuál', 'qué', 'soy', 'eres',
        'usted', 'señor', 'señora', 'de', 'el', 'la',
        'los', 'las', 'un', 'una', 'para', 'por', 'con'
    ]

    text_lower = text.lower()
    for word in spanish_words:
        pattern = r'\b' + re.escape(word) + r'\b'
        if re.search(pattern, text_lower):
            return 'spanish'

    # English indicators
    english_words = r'\b(hello|how|are|you|delivery|order|customer|thank|thanks|please|have|your|great|good|day|hi|morning|evening|night|yes|no|can|could|would|will|my|the|this|that|what|where|when|who|why|sorry|excuse|me)\b'
    if re.search(english_words, text.lower()):
        return 'english'

    # Check for common English patterns
    if re.search(r"(I'm|I am|you're|you are|it's|that's|what's)", text, re.IGNORECASE):
        return 'english'

    # Count definitive indicators
    has_articles_the = re.search(r'\bthe\b', text_lower)
    has_articles_el = re.search(r'\bel\b|\bla\b', text_lower)

    if has_articles_the:
        return 'english'
    if has_articles_el:
        return 'spanish'

    # Default to English (safer for mixed/unclear content)
    return 'english'

async def generate_segment(text: str, voice: str, temp_file: str) -> bool:
    """Generate audio for one text segment"""
    try:
        communicate = edge_tts.Communicate(text=text, voice=voice, rate="-20%")
        await communicate.save(temp_file)
        return True
    except Exception as e:
        print(f"   ⚠️  Error generating segment: {e}")
        return False

async def generate_dual_voice_audio(resource_id: int):
    """
    Generate concatenated dual-voice audio from aligned audio script

    Args:
        resource_id: Resource ID (must be in RESOURCE_PATHS)
    """
    # Get script path from mapping
    if resource_id not in RESOURCE_PATHS:
        print(f"   ❌ Resource {resource_id} not in RESOURCE_PATHS mapping")
        return False

    script_path = Path(RESOURCE_PATHS[resource_id])

    if not script_path.exists():
        print(f"   ❌ Script not found: {script_path}")
        return False

    # Read script
    with open(script_path, 'r', encoding='utf-8') as f:
        script_text = f.read()

    # Get voices for this resource
    spanish_voice, english_voice = get_voices_for_resource(resource_id)

    print(f"\n🎙️  Resource {resource_id}")
    print(f"   Script: {script_path}")
    print(f"   Spanish: {spanish_voice}")
    print(f"   English: {english_voice}")

    # Split into lines and FILTER OUT FORMATTING
    all_lines = [line.strip() for line in script_text.split('\n') if line.strip()]

    # STRICT FILTER: Only keep actual spoken content
    lines = []
    i = 0
    while i < len(all_lines):
        line = all_lines[i]

        # Skip ALL non-content lines
        if (line.startswith('#') or          # Headers
            line.startswith('===') or        # Dividers
            line.startswith('━━━') or        # Dividers
            line.startswith('---') or        # Dividers
            line.startswith('**') or         # Metadata
            line.startswith('(')):           # Parenthetical notes
            i += 1
            continue

        # Skip section header lines
        line_upper = line.upper().strip()
        if (line_upper.startswith('SECTION ') or
            line_upper == 'CORE CONCEPTS' or
            line_upper == 'MULTI-APP STRATEGY' or
            line_upper == 'EFFICIENCY METRICS' or
            line_upper == 'STRATEGY DISCUSSIONS' or
            line_upper.endswith(' BEST PRACTICES')):
            i += 1
            continue

        # Keep tips/notes as-is
        if line.startswith('['):
            lines.append(line)
            i += 1
            continue

        # Handle phrase groups after markers
        if i > 0 and '===' in all_lines[i-1] and 'PHRASE' in all_lines[i-1].upper():
            # Skip duplicate English description
            i += 1
            # Keep actual English phrase
            if i < len(all_lines):
                lines.append(all_lines[i])
                i += 1
            # Keep Spanish phrase
            if i < len(all_lines) and not all_lines[i].startswith('['):
                lines.append(all_lines[i])
                i += 1
            continue

        # UNIVERSAL DUPLICATE DETECTOR: Check if next line is identical
        if i + 1 < len(all_lines) and line == all_lines[i + 1]:
            # Skip first duplicate
            i += 1
            if i < len(all_lines):
                lines.append(all_lines[i])  # Keep second English
                i += 1
            if i < len(all_lines) and not all_lines[i].startswith('['):
                lines.append(all_lines[i])  # Keep Spanish
                i += 1
            continue

        # Default: keep the line if it's not empty and not parenthetical
        if line and not line.startswith('('):
            lines.append(line)
        i += 1

    if not lines:
        print(f"   ❌ No content in script after filtering")
        return False

    # Create temp directory
    temp_dir = Path('temp_audio_segments')
    temp_dir.mkdir(exist_ok=True)

    # Process each line into audio segments
    segments = []
    segment_count = 0

    for i, line in enumerate(lines):
        # Detect language
        lang = detect_language(line)

        # Get appropriate voice
        voice = spanish_voice if lang == 'spanish' else english_voice

        # Generate this segment
        temp_file = temp_dir / f'segment_{segment_count:03d}.mp3'

        print(f"   [{i+1}/{len(lines)}] {lang[:2].upper()}: {line[:50]}...")

        if await generate_segment(line, voice, str(temp_file)):
            try:
                # Load the audio segment
                audio = AudioSegment.from_mp3(str(temp_file))
                segments.append(audio)
            except Exception as e:
                print(f"   ⚠️  Error loading segment: {e}")
                continue

            # Add pause after each line
            if lang == 'english':
                # Longer pause after English (1 second)
                segments.append(AudioSegment.silent(duration=1000))
            else:
                # Shorter pause after Spanish (500ms)
                segments.append(AudioSegment.silent(duration=500))

            segment_count += 1

        await asyncio.sleep(0.5)  # Rate limiting

    if not segments:
        print(f"   ❌ No segments generated")
        return False

    # Concatenate all segments
    print(f"\n   🔄 Concatenating {len(segments)} segments...")
    final_audio = segments[0]
    for segment in segments[1:]:
        final_audio += segment

    # Export
    output_file = f'public/audio/resource-{resource_id}.mp3'
    print(f"   💾 Exporting to {output_file}...")
    final_audio.export(output_file, format='mp3', bitrate='128k')

    file_size = os.path.getsize(output_file) / (1024 * 1024)
    print(f"   ✅ COMPLETE: {file_size:.1f} MB")

    # Cleanup temp files
    import shutil
    shutil.rmtree(temp_dir, ignore_errors=True)

    return True

def parse_resource_list(args) -> list:
    """Parse command line arguments into list of resource IDs"""
    if args.all:
        # All 19 aligned resources (+ 2 pending)
        return sorted(RESOURCE_PATHS.keys())

    if args.group:
        if args.group == 1:
            # Group 1: 50-batch resources
            return [2, 7, 10, 13, 18, 21, 28, 32, 34]
        elif args.group == 2:
            # Group 2: audio-scripts resources
            return [5, 31, 45, 46, 47, 48, 49, 50, 51, 52]

    if args.resources:
        # Parse comma-separated list: "2,5,7"
        return [int(r.strip()) for r in args.resources.split(',')]

    return []

async def main():
    parser = argparse.ArgumentParser(
        description='Generate dual-voice audio for 19 aligned resources (+ 2 pending)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Generate all 19 resources:
    python scripts/generate-aligned-audio.py --all

  Generate specific resources:
    python scripts/generate-aligned-audio.py --resources 2,5,7

  Generate Group 1 (50-batch, 9 resources):
    python scripts/generate-aligned-audio.py --group 1

  Generate Group 2 (audio-scripts, 10 resources):
    python scripts/generate-aligned-audio.py --group 2
"""
    )
    parser.add_argument('--resources', help='Comma-separated resource IDs (e.g., 2,5,7)')
    parser.add_argument('--group', type=int, choices=[1, 2], help='Generate group 1 (50-batch) or group 2 (audio-scripts)')
    parser.add_argument('--all', action='store_true', help='Generate all 19 aligned resources')

    args = parser.parse_args()

    resource_ids = parse_resource_list(args)

    if not resource_ids:
        print("❌ No resources specified!")
        print("\nUsage:")
        print("  python scripts/generate-aligned-audio.py --all")
        print("  python scripts/generate-aligned-audio.py --resources 2,5,7")
        print("  python scripts/generate-aligned-audio.py --group 1")
        print("  python scripts/generate-aligned-audio.py --group 2")
        return

    print("🎙️  Dual-Voice Audio Generation - Aligned Resources")
    print("=" * 70)
    print(f"📊 Generating {len(resource_ids)} of 19 resources: {resource_ids}")
    print("=" * 70 + "\n")

    success_count = 0
    failed = []

    for resource_id in resource_ids:
        try:
            if await generate_dual_voice_audio(resource_id):
                success_count += 1
            else:
                failed.append(resource_id)
        except Exception as e:
            print(f"\n❌ Error processing resource {resource_id}: {e}")
            failed.append(resource_id)

        await asyncio.sleep(2)  # Pause between resources

    print("\n" + "=" * 70)
    print(f"✅ Success: {success_count}/{len(resource_ids)} files generated")

    if failed:
        print(f"❌ Failed: {failed}")

    print(f"\n📁 Location: public/audio/")
    print("🎉 Batch complete!")

if __name__ == '__main__':
    asyncio.run(main())
