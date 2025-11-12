# Hablas TTS Audio Generation Scripts

Production-ready Text-to-Speech audio generation system for all 21 Hablas resources.

## Quick Start

### 1. Install Dependencies
```bash
# Install Python packages
pip3 install -r requirements.txt

# Install ffmpeg (required by pydub)
# Ubuntu/Debian:
sudo apt install ffmpeg

# macOS:
brew install ffmpeg

# Windows:
# Download from https://ffmpeg.org and add to PATH
```

### 2. Generate All Audio Files
```bash
# Run from project root
python3 scripts/generate-tts-audio.py
```

### 3. Verify Output
```bash
# Check generated files
ls -lh public/audio/

# Should see 21 MP3 files:
# resource-2.mp3, resource-5.mp3, resource-7.mp3, etc.
```

## What This Script Does

### Input
Reads 21 audio script files from:
- `/public/generated-resources/50-batch/` (9 cleaned scripts)
- `/public/audio-scripts/` (10 new scripts)

### Processing
1. Parses bilingual content (Spanish/English)
2. Detects language automatically
3. Applies appropriate voice:
   - Spanish sections: Colombian Spanish (es-CO approximation)
   - English sections: American English (en-US)
4. Adds 2-second pauses between phrases
5. Combines into single MP3 per resource

### Output
- **Location**: `/public/audio/resource-{ID}.mp3`
- **Format**: MP3, 128kbps (mobile-optimized)
- **Size**: ~5-10 MB per file
- **Duration**: ~7-10 minutes per resource
- **Total**: ~150 MB for all 21 files

## Resource Mapping

### Group 1: Cleaned Audio Scripts (9)
| ID | Category | Script Location |
|----|----------|-----------------|
| 2 | Repartidor | 50-batch/repartidor/basic_audio_1-audio-script.txt |
| 7 | Repartidor | 50-batch/repartidor/basic_audio_2-audio-script.txt |
| 10 | Repartidor | 50-batch/repartidor/intermediate_conversations_1-audio-script.txt |
| 32 | Repartidor | 50-batch/repartidor/intermediate_conversations_2-audio-script.txt |
| 13 | Conductor | 50-batch/conductor/basic_audio_navigation_1-audio-script.txt |
| 18 | Conductor | 50-batch/conductor/basic_audio_navigation_2-audio-script.txt |
| 34 | Conductor | 50-batch/conductor/intermediate_audio_conversations_1-audio-script.txt |
| 21 | All | 50-batch/all/basic_greetings_all_1-audio-script.txt |
| 28 | All | 50-batch/all/basic_greetings_all_2-audio-script.txt |

### Group 2: New Audio Scripts (10)
| ID | Script | Location |
|----|--------|----------|
| 5 | Intermediate Situations 1 | audio-scripts/intermediate_situations_1-audio-script.txt |
| 31 | Intermediate Situations 2 | audio-scripts/intermediate_situations_2-audio-script.txt |
| 45 | Accident Procedures | audio-scripts/accident-procedures-audio-script.txt |
| 46 | Customer Conflict | audio-scripts/customer-conflict-audio-script.txt |
| 47 | Lost/Found Items | audio-scripts/lost-or-found-items-audio-script.txt |
| 48 | Medical Emergencies | audio-scripts/medical-emergencies-audio-script.txt |
| 49 | Payment Disputes | audio-scripts/payment-disputes-audio-script.txt |
| 50 | Safety Concerns | audio-scripts/safety-concerns-audio-script.txt |
| 51 | Vehicle Breakdown | audio-scripts/vehicle-breakdown-audio-script.txt |
| 52 | Weather Hazards | audio-scripts/weather-hazards-audio-script.txt |

## Features

### Intelligent Language Detection
Automatically detects Spanish vs English sections using:
- Language-specific keywords
- Special punctuation (¿ ¡)
- Explicit markers (`**Inglés:**`, `**Español:**`)

### Bilingual Voice Support
- **Spanish**: Uses `es` voice (closest to Colombian Spanish in gTTS)
- **English**: Uses `en` voice (American English)
- Seamless switching between languages

### Natural Pauses
- 2 seconds between phrases
- 3 seconds between major sections
- Mimics natural speech patterns

### Markdown Cleaning
Removes formatting while preserving content:
- Bold markers (`**text**`)
- Headers (`# ## ###`)
- Links (`[text](url)`)
- Special characters (→ •)

## Output Statistics

After generation completes, you'll see:

```
============================================================
📊 GENERATION SUMMARY
============================================================
✅ Successful: 21/21
❌ Failed: 0

📦 Total size: 156.32 MB
⏱️  Total duration: 189.50 minutes
💾 Average per file: 7.44 MB
⏱️  Average duration: 9.02 minutes
============================================================
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'gtts'"
```bash
pip3 install gtts pydub
```

### "FileNotFoundError: ffmpeg"
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg
```

### "Script not found" errors
Verify script files exist:
```bash
ls public/generated-resources/50-batch/repartidor/
ls public/audio-scripts/
```

### Audio quality issues
See `/docs/tts-service-comparison.md` for premium alternatives.

## Documentation

Comprehensive guides available in `/docs`:

1. **tts-generation-guide.md**
   - Step-by-step setup
   - Validation procedures
   - Deployment checklist

2. **tts-service-comparison.md**
   - gTTS vs Azure vs ElevenLabs vs OpenAI
   - Quality comparison
   - Feature comparison

3. **tts-cost-estimate.md**
   - Detailed cost breakdown
   - 3-year budget projections
   - ROI analysis

## Next Steps

1. **Generate audio**: `python3 scripts/generate-tts-audio.py`
2. **Test playback**: Open app and test 3-4 resources
3. **Collect feedback**: Get user opinions on quality
4. **Plan upgrade**: Review Azure Neural for Colombian accent

## Support

For issues or questions:
- Check tts-generation-guide.md troubleshooting section
- Review gTTS documentation: https://gtts.readthedocs.io/
- File issue in project repository
