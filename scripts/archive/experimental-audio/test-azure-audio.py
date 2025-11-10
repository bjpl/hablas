#!/usr/bin/env python3
"""
Quick test script for Azure TTS setup
Tests authentication and generates a short sample audio
"""

import os
import sys
from pathlib import Path

try:
    import azure.cognitiveservices.speech as speechsdk
except ImportError:
    print("Error: azure-cognitiveservices-speech not installed")
    print("Install with: pip install azure-cognitiveservices-speech")
    sys.exit(1)


def test_azure_connection():
    """Test Azure Speech Service connection"""
    subscription_key = os.environ.get('AZURE_SPEECH_KEY')
    region = os.environ.get('AZURE_SPEECH_REGION', 'eastus')

    if not subscription_key:
        print("❌ AZURE_SPEECH_KEY environment variable not set")
        print("\nSet it with:")
        print("  export AZURE_SPEECH_KEY='your-key-here'")
        return False

    print(f"✓ Subscription key found: {subscription_key[:8]}...")
    print(f"✓ Region: {region}")

    # Create speech config
    speech_config = speechsdk.SpeechConfig(
        subscription=subscription_key,
        region=region
    )

    # Set output format
    speech_config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3
    )

    # Test with Colombian Spanish voice
    speech_config.speech_synthesis_voice_name = 'es-CO-SalomeNeural'

    # Generate test audio
    test_output = Path('scripts/test-audio-output.mp3')
    audio_config = speechsdk.audio.AudioOutputConfig(filename=str(test_output))

    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config,
        audio_config=audio_config
    )

    print("\nGenerating test audio...")

    test_ssml = '''
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-CO">
        <voice name="es-CO-SalomeNeural">
            <prosody rate="0.8">
                Hola, bienvenido a Hablas. Esta es una prueba de audio generado con Azure.
                <break time="1000ms"/>
                Hi, welcome to Hablas. This is a test audio generated with Azure.
            </prosody>
        </voice>
    </speak>
    '''

    result = synthesizer.speak_ssml_async(test_ssml).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        file_size = test_output.stat().st_size
        print(f"✓ Test audio generated successfully!")
        print(f"✓ Output: {test_output}")
        print(f"✓ File size: {file_size / 1024:.2f} KB")
        print(f"\n✅ Azure TTS is configured correctly!")
        return True

    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = result.cancellation_details
        print(f"❌ Speech synthesis canceled: {cancellation_details.reason}")
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            print(f"   Error details: {cancellation_details.error_details}")
        return False

    return False


def main():
    print("=" * 60)
    print("Azure TTS Configuration Test")
    print("=" * 60)

    success = test_azure_connection()

    if not success:
        print("\n❌ Test failed. Please check your configuration.")
        sys.exit(1)

    print("\n🎉 All tests passed! You're ready to generate audio.")
    print("\nNext steps:")
    print("  1. Run: python scripts/generate-azure-audio.py")
    print("  2. Check: public/audio/ for generated files")
    sys.exit(0)


if __name__ == '__main__':
    main()
