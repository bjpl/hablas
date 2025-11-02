#!/usr/bin/env python3
"""
Azure TTS Audio Generation Script for Hablas Project
Generates high-quality MP3 audio files from audio-specs/*.json files
Follows sinonimos_de_ver pattern with Colombian/Mexican Spanish and American English voices
"""

import os
import sys
import json
import time
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime

try:
    import azure.cognitiveservices.speech as speechsdk
    from tqdm import tqdm
except ImportError:
    print("Error: Required packages not installed")
    print("Install with: pip install azure-cognitiveservices-speech tqdm")
    sys.exit(1)


# Voice mapping following sinonimos_de_ver pattern
VOICE_MAPPING = {
    2: 'es-CO-SalomeNeural',      # Colombian female - Delivery basics
    7: 'es-CO-GonzaloNeural',     # Colombian male - Delivery problems
    10: 'es-MX-DaliaNeural',      # Mexican female - Conversations
    13: 'en-US-JennyNeural',      # American female - Directions
    18: 'en-US-GuyNeural',        # American male - Directions advanced
    21: 'es-CO-SalomeNeural',     # Colombian female - Greetings
    28: 'es-CO-GonzaloNeural',    # Colombian male - Greetings advanced
    32: 'es-MX-JorgeNeural',      # Mexican male - Conversations advanced
    34: 'en-US-AriaNeural'        # American female - Dialogues
}

# Fallback voices for resources not in mapping
DEFAULT_SPANISH_VOICE = 'es-CO-SalomeNeural'  # Colombian Spanish
DEFAULT_ENGLISH_VOICE = 'en-US-JennyNeural'   # American English

# Speed settings for beginners
SPEECH_RATE = 0.8  # 80% speed for better comprehension
PAUSE_BETWEEN_PHRASES = 1500  # 1.5 seconds
PAUSE_BETWEEN_SECTIONS = 2000  # 2 seconds


@dataclass
class AudioStats:
    """Track generation statistics"""
    total_resources: int = 0
    successful: int = 0
    failed: int = 0
    skipped: int = 0
    total_duration: float = 0.0
    estimated_cost: float = 0.0

    def update_cost(self, character_count: int):
        """Update cost estimate based on Azure pricing ($1 per 1M characters for Neural voices)"""
        self.estimated_cost += (character_count / 1_000_000) * 1.0


@dataclass
class ResourceMetadata:
    """Metadata for generated audio resource"""
    resource_id: int
    title: str
    category: str
    level: str
    language: str
    duration: str
    voice: str
    character_count: int
    generated_at: str
    file_path: str
    file_size: int


class AzureAudioGenerator:
    """Main audio generation class"""

    def __init__(self, subscription_key: str, region: str = "eastus"):
        self.subscription_key = subscription_key
        self.region = region
        self.stats = AudioStats()
        self.metadata: List[ResourceMetadata] = []

        # Initialize Azure Speech Config
        self.speech_config = speechsdk.SpeechConfig(
            subscription=subscription_key,
            region=region
        )

        # Set output format to MP3 128kbps
        self.speech_config.set_speech_synthesis_output_format(
            speechsdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3
        )

    def get_voice_for_resource(self, resource_id: int, language: str) -> str:
        """Get appropriate voice for resource"""
        if resource_id in VOICE_MAPPING:
            return VOICE_MAPPING[resource_id]

        # Fallback based on language
        if 'spanish' in language.lower() or 'español' in language.lower():
            return DEFAULT_SPANISH_VOICE
        else:
            return DEFAULT_ENGLISH_VOICE

    def build_ssml(self, spec: Dict, voice_name: str) -> str:
        """Build SSML markup from audio spec"""
        content = spec.get('content', {})
        segments = content.get('segments', [])

        if not segments:
            raise ValueError(f"No segments found in spec")

        # Start SSML document
        ssml = f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-US">'
        ssml += f'<voice name="{voice_name}">'

        # Add prosody for slower speech rate
        ssml += f'<prosody rate="{SPEECH_RATE}">'

        for i, segment in enumerate(segments):
            text = segment.get('text', '').strip()
            if not text:
                continue

            # Escape XML special characters
            text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

            # Add segment text
            ssml += f'{text}'

            # Add pauses between segments
            if i < len(segments) - 1:
                ssml += f'<break time="{PAUSE_BETWEEN_SECTIONS}ms"/>'

        ssml += '</prosody>'
        ssml += '</voice>'
        ssml += '</speak>'

        return ssml

    def generate_audio(self, spec_path: Path, output_path: Path) -> Optional[ResourceMetadata]:
        """Generate audio file from spec"""
        try:
            # Load spec
            with open(spec_path, 'r', encoding='utf-8') as f:
                spec = json.load(f)

            metadata = spec.get('metadata', {})
            resource_id = metadata.get('resourceId', 0)
            title = metadata.get('title', 'Unknown')
            category = metadata.get('category', 'unknown')
            level = metadata.get('level', 'basico')
            language = metadata.get('language', 'spanish')
            duration = metadata.get('estimatedDuration', 'unknown')

            # Get appropriate voice
            voice_name = self.get_voice_for_resource(resource_id, language)

            # Build SSML
            ssml = self.build_ssml(spec, voice_name)
            character_count = len(ssml)

            # Configure audio output
            audio_config = speechsdk.audio.AudioOutputConfig(filename=str(output_path))

            # Update speech config with voice
            self.speech_config.speech_synthesis_voice_name = voice_name

            # Create synthesizer
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )

            # Synthesize audio
            result = synthesizer.speak_ssml_async(ssml).get()

            # Check result
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                file_size = output_path.stat().st_size

                # Create metadata
                meta = ResourceMetadata(
                    resource_id=resource_id,
                    title=title,
                    category=category,
                    level=level,
                    language=language,
                    duration=duration,
                    voice=voice_name,
                    character_count=character_count,
                    generated_at=datetime.utcnow().isoformat() + 'Z',
                    file_path=str(output_path.relative_to(Path.cwd())),
                    file_size=file_size
                )

                self.stats.successful += 1
                self.stats.update_cost(character_count)

                return meta

            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation_details = result.cancellation_details
                print(f"  ✗ Speech synthesis canceled: {cancellation_details.reason}")
                if cancellation_details.reason == speechsdk.CancellationReason.Error:
                    print(f"    Error details: {cancellation_details.error_details}")
                self.stats.failed += 1
                return None

        except Exception as e:
            print(f"  ✗ Error generating audio: {str(e)}")
            self.stats.failed += 1
            return None

    def generate_all(self, specs_dir: Path, output_dir: Path) -> bool:
        """Generate audio for all specs"""
        # Find all spec files
        spec_files = sorted(specs_dir.glob('resource-*-spec.json'))
        self.stats.total_resources = len(spec_files)

        if not spec_files:
            print(f"No spec files found in {specs_dir}")
            return False

        print(f"\n{'='*70}")
        print(f"Azure TTS Audio Generation - Hablas Project")
        print(f"{'='*70}")
        print(f"Total resources: {self.stats.total_resources}")
        print(f"Output directory: {output_dir}")
        print(f"Speech rate: {SPEECH_RATE}x (beginner-friendly)")
        print(f"{'='*70}\n")

        # Create output directory
        output_dir.mkdir(parents=True, exist_ok=True)

        # Process each spec with progress bar
        with tqdm(spec_files, desc="Generating audio", unit="file") as pbar:
            for spec_path in pbar:
                resource_id = spec_path.stem.replace('resource-', '').replace('-spec', '')
                output_path = output_dir / f"resource-{resource_id}.mp3"

                pbar.set_description(f"Processing resource {resource_id}")

                # Skip if already exists
                if output_path.exists():
                    self.stats.skipped += 1
                    pbar.write(f"  ⊙ Skipping resource {resource_id} (already exists)")
                    continue

                # Generate audio
                meta = self.generate_audio(spec_path, output_path)

                if meta:
                    self.metadata.append(meta)
                    size_mb = meta.file_size / (1024 * 1024)
                    pbar.write(f"  ✓ Generated resource {resource_id}: {size_mb:.2f}MB - {meta.voice}")

        return True

    def save_metadata(self, output_path: Path):
        """Save metadata.json file"""
        metadata_dict = {
            'generated_at': datetime.utcnow().isoformat() + 'Z',
            'generator': 'Azure Cognitive Services TTS',
            'version': '1.0.0',
            'speech_rate': SPEECH_RATE,
            'format': {
                'codec': 'MP3',
                'bitrate': '128kbps',
                'sample_rate': '16kHz',
                'channels': 'Mono'
            },
            'statistics': {
                'total_resources': self.stats.total_resources,
                'successful': self.stats.successful,
                'failed': self.stats.failed,
                'skipped': self.stats.skipped,
                'estimated_cost_usd': round(self.stats.estimated_cost, 4)
            },
            'voice_mapping': VOICE_MAPPING,
            'resources': [
                {
                    'resource_id': m.resource_id,
                    'title': m.title,
                    'category': m.category,
                    'level': m.level,
                    'language': m.language,
                    'duration': m.duration,
                    'voice': m.voice,
                    'character_count': m.character_count,
                    'generated_at': m.generated_at,
                    'file_path': m.file_path,
                    'file_size_bytes': m.file_size,
                    'file_size_mb': round(m.file_size / (1024 * 1024), 2)
                }
                for m in sorted(self.metadata, key=lambda x: x.resource_id)
            ]
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(metadata_dict, f, indent=2, ensure_ascii=False)

    def print_summary(self):
        """Print generation summary"""
        print(f"\n{'='*70}")
        print(f"Generation Summary")
        print(f"{'='*70}")
        print(f"Total resources:     {self.stats.total_resources}")
        print(f"Successfully generated: {self.stats.successful}")
        print(f"Failed:              {self.stats.failed}")
        print(f"Skipped (existing):  {self.stats.skipped}")
        print(f"Estimated cost:      ${self.stats.estimated_cost:.4f} USD")
        print(f"{'='*70}\n")

        if self.stats.failed > 0:
            print("⚠ Some files failed to generate. Check error messages above.")
        elif self.stats.successful > 0:
            print("✓ All files generated successfully!")


def main():
    """Main entry point"""
    # Get Azure credentials from environment
    subscription_key = os.environ.get('AZURE_SPEECH_KEY')
    region = os.environ.get('AZURE_SPEECH_REGION', 'eastus')

    if not subscription_key:
        print("Error: AZURE_SPEECH_KEY environment variable not set")
        print("\nUsage:")
        print("  export AZURE_SPEECH_KEY='your-key-here'")
        print("  export AZURE_SPEECH_REGION='eastus'  # Optional, defaults to eastus")
        print("  python scripts/generate-azure-audio.py")
        sys.exit(1)

    # Set up paths
    project_root = Path(__file__).parent.parent
    specs_dir = project_root / 'audio-specs'
    output_dir = project_root / 'public' / 'audio'
    metadata_path = output_dir / 'metadata.json'

    # Validate specs directory
    if not specs_dir.exists():
        print(f"Error: Specs directory not found: {specs_dir}")
        sys.exit(1)

    # Create generator
    generator = AzureAudioGenerator(subscription_key, region)

    # Generate audio files
    start_time = time.time()
    success = generator.generate_all(specs_dir, output_dir)
    elapsed_time = time.time() - start_time

    if not success:
        sys.exit(1)

    # Save metadata
    if generator.metadata:
        generator.save_metadata(metadata_path)
        print(f"✓ Metadata saved to {metadata_path}")

    # Print summary
    generator.print_summary()
    print(f"Total time: {elapsed_time:.2f} seconds")

    # Return exit code
    sys.exit(0 if generator.stats.failed == 0 else 1)


if __name__ == '__main__':
    main()
