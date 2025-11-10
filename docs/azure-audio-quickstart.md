# Azure Audio Generation - Quick Start

## Setup (3 Steps)

```bash
# 1. Install dependencies
pip install -r scripts/azure-audio-requirements.txt

# 2. Set Azure credentials
export AZURE_SPEECH_KEY="your-key-here"
export AZURE_SPEECH_REGION="eastus"

# 3. Generate audio
python scripts/generate-azure-audio.py
```

## Commands

```bash
# Test configuration
python scripts/test-azure-audio.py

# Generate all audio files
python scripts/generate-azure-audio.py

# Using convenience scripts
./scripts/run-azure-audio.sh          # Unix/Mac
scripts\run-azure-audio.bat           # Windows

# Test only
./scripts/run-azure-audio.sh --test
```

## Voice Mapping

| Resource | Voice | Language | Category |
|----------|-------|----------|----------|
| 2 | es-CO-SalomeNeural | Colombian Spanish (F) | Delivery basics |
| 7 | es-CO-GonzaloNeural | Colombian Spanish (M) | Delivery problems |
| 10 | es-MX-DaliaNeural | Mexican Spanish (F) | Conversations |
| 13 | en-US-JennyNeural | American English (F) | Directions |
| 18 | en-US-GuyNeural | American English (M) | Directions advanced |
| 21 | es-CO-SalomeNeural | Colombian Spanish (F) | Greetings |
| 28 | es-CO-GonzaloNeural | Colombian Spanish (M) | Greetings advanced |
| 32 | es-MX-JorgeNeural | Mexican Spanish (M) | Conversations advanced |
| 34 | en-US-AriaNeural | American English (F) | Dialogues |

## Output

```
public/audio/
├── resource-{id}.mp3    # Generated audio files
└── metadata.json        # Generation statistics
```

## Audio Settings

- **Format**: MP3, 128kbps, 16kHz, Mono
- **Speed**: 0.8x (beginner-friendly)
- **Pauses**: 2s sections, 1.5s phrases

## Cost

- **Pricing**: $1/1M characters
- **Per resource**: ~$0.0025 (2,500 chars avg)
- **9 resources**: ~$0.0225
- **50 resources**: ~$0.125

## Troubleshooting

### No credentials
```bash
# Set in environment
export AZURE_SPEECH_KEY="..."
```

### Connection error
- Check internet connection
- Verify Azure key is active
- Try different region

### Quota exceeded
- Check Azure portal limits
- Upgrade to paid tier
- Wait for monthly reset

## Get Azure Credentials

1. Go to https://portal.azure.com
2. Create **Speech Service** resource
3. Copy **Key** and **Region**
4. Set as environment variables

## Quick Test

```python
# Test single resource
from pathlib import Path
from generate_azure_audio import AzureAudioGenerator

gen = AzureAudioGenerator("your-key", "eastus")
meta = gen.generate_audio(
    Path("audio-specs/resource-2-spec.json"),
    Path("public/audio/resource-2.mp3")
)
print(f"Size: {meta.file_size_mb}MB")
```

## Integration

```typescript
// React Native
const audioUrl = `${BASE_URL}/resource-${id}.mp3`;
await Audio.Sound.createAsync({ uri: audioUrl });
```

## Files

- **scripts/generate-azure-audio.py** - Main generator
- **scripts/test-azure-audio.py** - Configuration test
- **scripts/AZURE_AUDIO_README.md** - Full documentation
- **docs/azure-audio-generation-guide.md** - Complete guide

---

**Need help?** See full docs in `scripts/AZURE_AUDIO_README.md`
