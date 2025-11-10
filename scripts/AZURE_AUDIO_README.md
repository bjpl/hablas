# Azure TTS Audio Generation for Hablas

Generate high-quality MP3 audio files from audio-specs using Azure Cognitive Services Text-to-Speech.

## Features

- **Voice Distribution**: Colombian/Mexican Spanish + American English neural voices
- **Beginner-Friendly**: 0.8x speed for better comprehension
- **High Quality**: 128kbps MP3 @ 16kHz
- **Progress Tracking**: Real-time progress bars and statistics
- **Cost Tracking**: Automatic cost estimation
- **Metadata Generation**: Complete metadata.json output
- **Resume Support**: Skips already generated files

## Voice Mapping

Following the sinonimos_de_ver pattern:

```python
Resource 2:  es-CO-SalomeNeural   (Colombian female - Delivery basics)
Resource 7:  es-CO-GonzaloNeural  (Colombian male - Delivery problems)
Resource 10: es-MX-DaliaNeural    (Mexican female - Conversations)
Resource 13: en-US-JennyNeural    (American female - Directions)
Resource 18: en-US-GuyNeural      (American male - Directions advanced)
Resource 21: es-CO-SalomeNeural   (Colombian female - Greetings)
Resource 28: es-CO-GonzaloNeural  (Colombian male - Greetings advanced)
Resource 32: es-MX-JorgeNeural    (Mexican male - Conversations advanced)
Resource 34: en-US-AriaNeural     (American female - Dialogues)
```

## Setup

### 1. Install Python Dependencies

```bash
pip install -r scripts/azure-audio-requirements.txt
```

### 2. Configure Azure Credentials

Set up your Azure Speech Service credentials:

```bash
# Windows (PowerShell)
$env:AZURE_SPEECH_KEY = "your-key-here"
$env:AZURE_SPEECH_REGION = "eastus"

# Linux/Mac
export AZURE_SPEECH_KEY="your-key-here"
export AZURE_SPEECH_REGION="eastus"
```

Get your credentials from: https://portal.azure.com
- Create a Speech Service resource
- Copy the Key and Region

### 3. Run Generation

```bash
python scripts/generate-azure-audio.py
```

## Output

### Directory Structure

```
public/audio/
├── resource-2.mp3
├── resource-7.mp3
├── resource-10.mp3
├── resource-13.mp3
├── resource-18.mp3
├── resource-21.mp3
├── resource-28.mp3
├── resource-32.mp3
├── resource-34.mp3
└── metadata.json
```

### Metadata Format

```json
{
  "generated_at": "2025-10-29T02:30:00.000Z",
  "generator": "Azure Cognitive Services TTS",
  "version": "1.0.0",
  "speech_rate": 0.8,
  "format": {
    "codec": "MP3",
    "bitrate": "128kbps",
    "sample_rate": "16kHz",
    "channels": "Mono"
  },
  "statistics": {
    "total_resources": 9,
    "successful": 9,
    "failed": 0,
    "skipped": 0,
    "estimated_cost_usd": 0.0245
  },
  "resources": [
    {
      "resource_id": 2,
      "title": "Pronunciación: Entregas - Var 1",
      "category": "repartidor",
      "level": "basico",
      "language": "Bilingual (Spanish/English)",
      "duration": "7:15 minutes",
      "voice": "es-CO-SalomeNeural",
      "character_count": 2450,
      "file_size_mb": 8.3
    }
  ]
}
```

## Cost Estimation

Azure Neural TTS pricing: **$1.00 per 1M characters**

Estimated costs for Hablas project:
- Average audio: ~2,500 characters = $0.0025 USD
- 9 resources: ~22,500 characters = $0.0225 USD
- 50 resources: ~125,000 characters = $0.125 USD

## Audio Quality Settings

- **Format**: MP3 (MPEG-1 Audio Layer 3)
- **Bitrate**: 128kbps (optimized for mobile)
- **Sample Rate**: 16kHz (neural voice optimized)
- **Channels**: Mono (reduces file size)
- **Speech Rate**: 0.8x (beginner-friendly)
- **Pauses**:
  - Between sections: 2 seconds
  - Between phrases: 1.5 seconds

## Troubleshooting

### Authentication Error

```
Error: AZURE_SPEECH_KEY environment variable not set
```

**Solution**: Set up Azure credentials (see Setup section)

### Synthesis Failed

```
Speech synthesis canceled: Error
Error details: Connection timeout
```

**Solutions**:
- Check internet connection
- Verify Azure credentials are correct
- Ensure Azure Speech Service is active in your subscription
- Try different region (e.g., 'westus', 'centralus')

### Out of Quota

```
Error: QuotaExceeded
```

**Solution**:
- Check Azure portal for quota limits
- Upgrade to paid tier if using free tier
- Wait for quota to reset (free tier resets monthly)

## Development

### Testing Single Resource

```python
from pathlib import Path
from generate_azure_audio import AzureAudioGenerator

generator = AzureAudioGenerator(
    subscription_key="your-key",
    region="eastus"
)

spec_path = Path("audio-specs/resource-2-spec.json")
output_path = Path("public/audio/resource-2.mp3")

meta = generator.generate_audio(spec_path, output_path)
print(f"Generated: {meta.file_size} bytes")
```

### Custom Voice Selection

Modify `VOICE_MAPPING` dictionary in the script:

```python
VOICE_MAPPING = {
    2: 'es-MX-DaliaNeural',  # Use Mexican voice instead
    # ... other mappings
}
```

Available voices: https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support

## Integration with Hablas App

The generated audio files can be used directly in the Hablas mobile app:

```typescript
// In your React Native component
const audioUrl = `${AUDIO_BASE_URL}/resource-${resourceId}.mp3`;

<Audio
  source={{ uri: audioUrl }}
  rate={1.0}  // User can adjust speed
  shouldPlay={true}
/>
```

## Next Steps

1. Generate all audio files: `python scripts/generate-azure-audio.py`
2. Review metadata.json for quality checks
3. Upload to CDN or include in app bundle
4. Update app configuration with audio URLs
5. Test playback on mobile devices

## Support

- Azure Speech Documentation: https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/
- Azure Pricing: https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/
- Script issues: Check logs and error messages for debugging
