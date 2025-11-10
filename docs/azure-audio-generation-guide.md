# Azure Audio Generation Implementation Guide

## Overview

Complete implementation of Azure Cognitive Services Text-to-Speech for generating high-quality audio files for the Hablas language learning app.

## Files Created

### Core Scripts

1. **scripts/generate-azure-audio.py** (Main generator)
   - Reads audio-specs/*.json files
   - Generates MP3 files using Azure Neural TTS
   - Creates metadata.json with generation statistics
   - Implements voice mapping for authentic accents

2. **scripts/test-azure-audio.py** (Configuration test)
   - Validates Azure credentials
   - Tests connection to Azure Speech Service
   - Generates sample audio to verify setup

3. **scripts/azure-audio-requirements.txt** (Dependencies)
   - Python package requirements
   - azure-cognitiveservices-speech>=1.35.0
   - tqdm>=4.66.0

### Helper Scripts

4. **scripts/run-azure-audio.sh** (Unix/Mac launcher)
   - Checks Python installation
   - Validates Azure credentials
   - Installs dependencies if needed
   - Runs generation with error handling

5. **scripts/run-azure-audio.bat** (Windows launcher)
   - Same functionality as .sh for Windows
   - Works with both CMD and PowerShell

### Documentation

6. **scripts/AZURE_AUDIO_README.md** (Complete usage guide)
   - Setup instructions
   - Voice mapping details
   - Cost estimation
   - Troubleshooting guide

## Voice Distribution Strategy

Following the sinonimos_de_ver pattern for authentic regional accents:

### Colombian Spanish (Delivery Content)
- **es-CO-SalomeNeural** (Female): Resources 2, 21
- **es-CO-GonzaloNeural** (Male): Resources 7, 28

### Mexican Spanish (Conversations)
- **es-MX-DaliaNeural** (Female): Resource 10
- **es-MX-JorgeNeural** (Male): Resource 32

### American English (Directions & Dialogues)
- **en-US-JennyNeural** (Female): Resource 13
- **en-US-GuyNeural** (Male): Resource 18
- **en-US-AriaNeural** (Female): Resource 34

## Quick Start

### 1. Install Dependencies

```bash
pip install -r scripts/azure-audio-requirements.txt
```

### 2. Configure Azure Credentials

```bash
# Get from: https://portal.azure.com
export AZURE_SPEECH_KEY="your-key-here"
export AZURE_SPEECH_REGION="eastus"
```

### 3. Test Configuration

```bash
python scripts/test-azure-audio.py
```

### 4. Generate Audio

```bash
# Using Python directly
python scripts/generate-azure-audio.py

# Or using convenience script (Unix/Mac)
./scripts/run-azure-audio.sh

# Or using convenience script (Windows)
scripts\run-azure-audio.bat
```

## Audio Quality Specifications

### Format
- **Codec**: MP3 (MPEG-1 Audio Layer 3)
- **Bitrate**: 128kbps
- **Sample Rate**: 16kHz (neural voice optimized)
- **Channels**: Mono (reduced file size)

### Speech Settings
- **Rate**: 0.8x (80% speed for beginners)
- **Pause Between Sections**: 2 seconds
- **Pause Between Phrases**: 1.5 seconds

### File Sizes (Estimated)
- Average per resource: 6-10 MB
- Total for 9 resources: ~70-90 MB
- Total for 50 resources: ~400-500 MB

## Output Structure

```
public/audio/
├── resource-2.mp3          # Delivery basics (Colombian female)
├── resource-7.mp3          # Delivery problems (Colombian male)
├── resource-10.mp3         # Conversations (Mexican female)
├── resource-13.mp3         # Directions (American female)
├── resource-18.mp3         # Directions advanced (American male)
├── resource-21.mp3         # Greetings (Colombian female)
├── resource-28.mp3         # Greetings advanced (Colombian male)
├── resource-32.mp3         # Conversations advanced (Mexican male)
├── resource-34.mp3         # Dialogues (American female)
└── metadata.json           # Generation metadata
```

## Metadata Format

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
  "voice_mapping": {
    "2": "es-CO-SalomeNeural",
    "7": "es-CO-GonzaloNeural"
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

## Cost Analysis

### Azure Pricing
- Neural TTS: **$1.00 per 1M characters**
- Free tier: 500,000 characters/month

### Estimated Costs
- Per resource (avg 2,500 chars): $0.0025
- 9 current resources: $0.0225
- 50 complete resources: $0.125
- 100 resources: $0.25

### Optimization Tips
1. Use free tier for development/testing
2. Generate in batches to reduce API calls
3. Cache generated audio files
4. Skip regeneration of unchanged content

## Features

### Progress Tracking
- Real-time progress bars (tqdm)
- Per-file status updates
- Success/failure counting

### Error Handling
- Validates Azure credentials
- Checks file permissions
- Reports synthesis errors
- Continues on individual failures

### Resume Support
- Skips existing files
- Tracks skipped count
- Allows incremental generation

### Cost Tracking
- Calculates character count
- Estimates USD cost
- Reports in summary

## Integration with Hablas App

### React Native Audio

```typescript
import { Audio } from 'expo-av';

const AUDIO_BASE_URL = 'https://your-cdn.com/audio';

async function playResource(resourceId: number) {
  const sound = await Audio.Sound.createAsync(
    { uri: `${AUDIO_BASE_URL}/resource-${resourceId}.mp3` },
    { shouldPlay: true, rate: 1.0 }
  );

  return sound;
}
```

### Speed Control

```typescript
// User adjustable playback speed
await sound.setRateAsync(
  1.0,   // Normal speed
  true   // Should correct pitch
);

// Speed options
const SPEEDS = [0.75, 1.0, 1.25, 1.5];
```

### Download for Offline

```typescript
import * as FileSystem from 'expo-file-system';

async function downloadAudio(resourceId: number) {
  const url = `${AUDIO_BASE_URL}/resource-${resourceId}.mp3`;
  const localPath = `${FileSystem.documentDirectory}resource-${resourceId}.mp3`;

  const download = await FileSystem.downloadAsync(url, localPath);
  return download.uri;
}
```

## Advanced Usage

### Custom Voice Selection

Modify `VOICE_MAPPING` in generate-azure-audio.py:

```python
VOICE_MAPPING = {
    2: 'es-MX-DaliaNeural',  # Change to Mexican accent
    # ... other mappings
}
```

### Different Speech Rate

Modify `SPEECH_RATE` constant:

```python
SPEECH_RATE = 1.0  # Normal speed
# or
SPEECH_RATE = 0.7  # Slower for complete beginners
```

### Regional Testing

Generate test samples with different voices:

```python
from generate_azure_audio import AzureAudioGenerator

generator = AzureAudioGenerator(key, region)

# Test Colombian voice
test_colombian(generator, 'es-CO-SalomeNeural')

# Test Mexican voice
test_mexican(generator, 'es-MX-DaliaNeural')
```

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Verify AZURE_SPEECH_KEY is set
   - Check key is valid in Azure portal
   - Ensure Speech Service is active

2. **Connection Timeout**
   - Check internet connection
   - Try different Azure region
   - Verify firewall settings

3. **Quota Exceeded**
   - Check Azure portal for limits
   - Upgrade from free to paid tier
   - Wait for monthly quota reset

4. **Invalid SSML**
   - Check audio-specs/*.json format
   - Verify text encoding (UTF-8)
   - Escape XML special characters

### Debug Mode

Add verbose logging:

```python
# In generate-azure-audio.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Performance

### Generation Speed
- Average: ~2-3 seconds per resource
- 9 resources: ~20-30 seconds
- 50 resources: ~2-3 minutes

### Optimization
- Uses async API calls where possible
- Skips existing files
- Efficient SSML construction
- Minimal memory footprint

## Future Enhancements

### Planned Features
1. Parallel generation (multiple resources simultaneously)
2. Audio post-processing (normalization, EQ)
3. Background music integration
4. Voice emotion/style controls
5. A/B testing different voices
6. Quality validation checks
7. Automatic CDN upload

### Voice Expansion
- Add more regional variants
- Support for additional languages
- Custom voice training
- Emotion/style parameters

## Security

### Best Practices
1. Never commit Azure keys to git
2. Use environment variables
3. Rotate keys regularly
4. Monitor usage in Azure portal
5. Set up billing alerts
6. Use managed identities in production

### Key Management

```bash
# Store in .env file (add to .gitignore)
AZURE_SPEECH_KEY=your-key-here
AZURE_SPEECH_REGION=eastus

# Load in script
from dotenv import load_dotenv
load_dotenv()
```

## Support Resources

- **Azure Speech Docs**: https://learn.microsoft.com/azure/cognitive-services/speech-service/
- **Voice Gallery**: https://speech.microsoft.com/portal/voicegallery
- **Pricing Calculator**: https://azure.microsoft.com/pricing/calculator/
- **SSML Reference**: https://learn.microsoft.com/azure/cognitive-services/speech-service/speech-synthesis-markup

## License

This implementation is part of the Hablas project and follows the project's licensing terms.

## Contributing

To improve the audio generation:
1. Test with different voices
2. Optimize SSML generation
3. Add quality validation
4. Implement caching strategies
5. Document voice selection criteria

---

**Generated**: 2025-10-29
**Version**: 1.0.0
**Author**: Claude Code Implementation Agent
