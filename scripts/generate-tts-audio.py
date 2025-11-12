#!/usr/bin/env python3
"""
Production TTS Audio Generator for Hablas App
Generates bilingual audio for all 21 aligned resources using gTTS
"""

import os
import json
import re
from pathlib import Path
from gtts import gTTS
from pydub import AudioSegment
from pydub.generators import Sine
import time

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
AUDIO_OUTPUT_DIR = PROJECT_ROOT / "public" / "audio"
METADATA_FILE = PROJECT_ROOT / "public" / "metadata" / "metadata.json"

# Resource mapping: ID -> Script file path
RESOURCE_MAP = {
    # Group 1: Cleaned audio scripts (9 resources)
    2: "public/generated-resources/50-batch/repartidor/basic_audio_1-audio-script.txt",
    7: "public/generated-resources/50-batch/repartidor/basic_audio_2-audio-script.txt",
    10: "public/generated-resources/50-batch/repartidor/intermediate_conversations_1-audio-script.txt",
    32: "public/generated-resources/50-batch/repartidor/intermediate_conversations_2-audio-script.txt",
    13: "public/generated-resources/50-batch/conductor/basic_audio_navigation_1-audio-script.txt",
    18: "public/generated-resources/50-batch/conductor/basic_audio_navigation_2-audio-script.txt",
    34: "public/generated-resources/50-batch/conductor/intermediate_audio_conversations_1-audio-script.txt",
    21: "public/generated-resources/50-batch/all/basic_greetings_all_1-audio-script.txt",
    28: "public/generated-resources/50-batch/all/basic_greetings_all_2-audio-script.txt",

    # Group 2: New audio scripts (10 resources)
    5: "public/audio-scripts/intermediate_situations_1-audio-script.txt",
    31: "public/audio-scripts/intermediate_situations_2-audio-script.txt",
    45: "public/audio-scripts/accident-procedures-audio-script.txt",
    46: "public/audio-scripts/customer-conflict-audio-script.txt",
    47: "public/audio-scripts/lost-or-found-items-audio-script.txt",
    48: "public/audio-scripts/medical-emergencies-audio-script.txt",
    49: "public/audio-scripts/payment-disputes-audio-script.txt",
    50: "public/audio-scripts/safety-concerns-audio-script.txt",
    51: "public/audio-scripts/vehicle-breakdown-audio-script.txt",
    52: "public/audio-scripts/weather-hazards-audio-script.txt",
}


class BilingualTTSGenerator:
    """Generate bilingual TTS audio with intelligent language detection"""

    def __init__(self):
        self.spanish_voice = "es"  # Colombian Spanish (es-US closest to Colombian)
        self.english_voice = "en"  # American English

        # Language detection patterns
        self.spanish_indicators = [
            r'\b(cuando|donde|como|porque|para|con|sin|muy|más|menos|todos|todo|esta|este|están|estoy)\b',
            r'\b(hola|gracias|por favor|disculpe|perdón|buenos días|buenas|noche)\b',
            r'[¿¡]',  # Spanish punctuation
        ]

        self.english_indicators = [
            r'\b(when|where|how|because|for|with|without|very|more|less|all|this|are|am)\b',
            r'\b(hello|thanks|please|excuse|sorry|good morning|good evening)\b',
            r'\b(the|a|an|and|or|but|is|was|have|has)\b',
        ]

    def detect_language(self, text: str) -> str:
        """Detect if text is Spanish or English"""
        text_lower = text.lower()

        spanish_score = sum(1 for pattern in self.spanish_indicators
                          if re.search(pattern, text_lower, re.IGNORECASE))
        english_score = sum(1 for pattern in self.english_indicators
                          if re.search(pattern, text_lower, re.IGNORECASE))

        # Default to Spanish for headers, English for phrase sections
        if spanish_score > english_score:
            return "es"
        elif english_score > spanish_score:
            return "en"
        else:
            # Check for explicit markers
            if "**Inglés:**" in text or "**English:**" in text:
                return "en"
            elif "**Español:**" in text or "**Spanish:**" in text:
                return "es"
            return "es"  # Default to Spanish

    def clean_text(self, text: str) -> str:
        """Clean markdown and formatting from text"""
        # Remove markdown formatting
        text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)  # Bold
        text = re.sub(r'_(.+?)_', r'\1', text)  # Italic
        text = re.sub(r'#+ ', '', text)  # Headers
        text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)  # Links
        text = re.sub(r'`(.+?)`', r'\1', text)  # Code

        # Remove special characters but keep punctuation
        text = re.sub(r'[→•]', '', text)

        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()

        return text

    def parse_script(self, script_path: Path) -> list:
        """Parse script file into segments with language tags"""
        with open(script_path, 'r', encoding='utf-8') as f:
            content = f.read()

        segments = []
        lines = content.split('\n')

        current_segment = []
        current_lang = None

        for line in lines:
            line = line.strip()

            # Skip empty lines and separators
            if not line or line.startswith('---') or line.startswith('##'):
                if current_segment:
                    # Save accumulated segment
                    text = ' '.join(current_segment)
                    cleaned = self.clean_text(text)
                    if cleaned:
                        segments.append({
                            'text': cleaned,
                            'lang': current_lang or 'es'
                        })
                    current_segment = []
                    current_lang = None
                continue

            # Detect language markers
            if "**Inglés:**" in line or "**English:**" in line:
                current_lang = "en"
                # Extract text after marker
                text = re.sub(r'\*\*(?:Inglés|English):\*\*\s*', '', line)
                if text:
                    current_segment.append(text)
                continue
            elif "**Español:**" in line or "**Spanish:**" in line:
                current_lang = "es"
                text = re.sub(r'\*\*(?:Español|Spanish):\*\*\s*', '', line)
                if text:
                    current_segment.append(text)
                continue
            elif "**Pronunciación:**" in line:
                current_lang = "es"  # Pronunciation guides are in Spanish
                text = re.sub(r'\*\*Pronunciación:\*\*\s*', '', line)
                if text:
                    current_segment.append(text)
                continue

            # Add line to current segment
            if line and not line.startswith('**') and not line.startswith('###'):
                current_segment.append(line)

        # Don't forget last segment
        if current_segment:
            text = ' '.join(current_segment)
            cleaned = self.clean_text(text)
            if cleaned:
                segments.append({
                    'text': cleaned,
                    'lang': current_lang or 'es'
                })

        return segments

    def generate_pause(self, duration_ms: int) -> AudioSegment:
        """Generate silent pause"""
        return AudioSegment.silent(duration=duration_ms)

    def text_to_speech(self, text: str, lang: str, slow: bool = False) -> AudioSegment:
        """Convert text to speech using gTTS"""
        try:
            tts = gTTS(text=text, lang=lang, slow=slow)

            # Save to temporary file
            temp_file = f"/tmp/temp_tts_{time.time()}.mp3"
            tts.save(temp_file)

            # Load as AudioSegment
            audio = AudioSegment.from_mp3(temp_file)

            # Cleanup
            os.remove(temp_file)

            return audio
        except Exception as e:
            print(f"Error generating TTS: {e}")
            return AudioSegment.silent(duration=1000)

    def generate_audio(self, resource_id: int, script_path: Path, output_path: Path) -> dict:
        """Generate complete audio file for a resource"""
        print(f"\n📢 Generating audio for Resource {resource_id}...")
        print(f"   Script: {script_path}")

        # Parse script
        segments = self.parse_script(script_path)
        print(f"   Found {len(segments)} segments")

        # Combine audio segments
        full_audio = AudioSegment.empty()

        for i, segment in enumerate(segments):
            text = segment['text']
            lang = segment['lang']

            # Skip very short segments
            if len(text) < 5:
                continue

            print(f"   [{i+1}/{len(segments)}] {lang.upper()}: {text[:50]}...")

            # Generate speech
            audio = self.text_to_speech(text, lang, slow=False)

            # Add to full audio
            full_audio += audio

            # Add pause between segments (2 seconds)
            full_audio += self.generate_pause(2000)

        # Export as MP3 (128kbps for mobile optimization)
        print(f"   Exporting to: {output_path}")
        full_audio.export(
            output_path,
            format="mp3",
            bitrate="128k",
            parameters=["-q:a", "2"]  # Quality setting
        )

        # Get file stats
        file_size_mb = output_path.stat().st_size / (1024 * 1024)
        duration_min = len(full_audio) / 60000

        print(f"   ✅ Complete! Size: {file_size_mb:.2f} MB, Duration: {duration_min:.2f} min")

        return {
            'resource_id': resource_id,
            'file_path': str(output_path.relative_to(PROJECT_ROOT)),
            'file_size_mb': round(file_size_mb, 2),
            'duration_minutes': round(duration_min, 2),
            'segments': len(segments)
        }

    def update_metadata(self, audio_info: dict):
        """Update metadata.json with audio file information"""
        if not METADATA_FILE.exists():
            print(f"   ⚠️  Metadata file not found: {METADATA_FILE}")
            return

        with open(METADATA_FILE, 'r', encoding='utf-8') as f:
            metadata = json.load(f)

        # Find and update resource
        for resource in metadata.get('resources', []):
            if resource.get('id') == audio_info['resource_id']:
                resource['audioUrl'] = f"/audio/resource-{audio_info['resource_id']}.mp3"
                resource['audioFileSize'] = audio_info['file_size_mb']
                resource['audioDuration'] = audio_info['duration_minutes']
                resource['audioGenerated'] = True
                print(f"   ✅ Updated metadata for Resource {audio_info['resource_id']}")
                break

        # Save updated metadata
        with open(METADATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)


def main():
    """Main execution function"""
    print("=" * 60)
    print("🎙️  HABLAS TTS AUDIO GENERATOR")
    print("=" * 60)

    # Create output directory
    AUDIO_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Initialize generator
    generator = BilingualTTSGenerator()

    # Track statistics
    total_resources = len(RESOURCE_MAP)
    successful = 0
    failed = []
    total_size_mb = 0
    total_duration_min = 0

    print(f"\n📊 Processing {total_resources} resources...\n")

    # Generate audio for each resource
    for resource_id, script_rel_path in RESOURCE_MAP.items():
        script_path = PROJECT_ROOT / script_rel_path

        if not script_path.exists():
            print(f"❌ Resource {resource_id}: Script not found at {script_path}")
            failed.append(resource_id)
            continue

        output_path = AUDIO_OUTPUT_DIR / f"resource-{resource_id}.mp3"

        try:
            # Generate audio
            audio_info = generator.generate_audio(resource_id, script_path, output_path)

            # Update metadata
            generator.update_metadata(audio_info)

            # Update statistics
            successful += 1
            total_size_mb += audio_info['file_size_mb']
            total_duration_min += audio_info['duration_minutes']

        except Exception as e:
            print(f"❌ Resource {resource_id}: Error - {e}")
            failed.append(resource_id)

    # Print summary
    print("\n" + "=" * 60)
    print("📊 GENERATION SUMMARY")
    print("=" * 60)
    print(f"✅ Successful: {successful}/{total_resources}")
    print(f"❌ Failed: {len(failed)}")
    if failed:
        print(f"   Failed IDs: {', '.join(map(str, failed))}")
    print(f"\n📦 Total size: {total_size_mb:.2f} MB")
    print(f"⏱️  Total duration: {total_duration_min:.2f} minutes")
    print(f"💾 Average per file: {total_size_mb/successful:.2f} MB")
    print(f"⏱️  Average duration: {total_duration_min/successful:.2f} minutes")
    print("=" * 60)


if __name__ == "__main__":
    main()
