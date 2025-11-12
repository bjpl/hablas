# TTS Audio Generation Guide

Complete step-by-step guide for generating bilingual audio for all 21 Hablas resources.

## Prerequisites

### 1. Python Installation
```bash
# Check Python version (requires 3.8+)
python3 --version

# If not installed, install Python 3.8+
# Ubuntu/Debian:
sudo apt update
sudo apt install python3 python3-pip

# macOS:
brew install python3

# Windows:
# Download from python.org
```

### 2. Install Required Packages
```bash
# Navigate to project root
cd /path/to/hablas

# Install dependencies
pip3 install gtts pydub

# Install ffmpeg (required by pydub)
# Ubuntu/Debian:
sudo apt install ffmpeg

# macOS:
brew install ffmpeg

# Windows:
# Download from ffmpeg.org
```

### 3. Verify Installation
```bash
python3 -c "import gtts; import pydub; print('All packages installed successfully!')"
```

## Usage

### Generate All Audio Files

**Single Command:**
```bash
python3 scripts/generate-tts-audio.py
```

This will:
1. Generate 21 MP3 files in `/public/audio/`
2. Update `metadata.json` with audio URLs
3. Display progress and statistics

### Expected Output

```
============================================================
🎙️  HABLAS TTS AUDIO GENERATOR
============================================================

📊 Processing 21 resources...

📢 Generating audio for Resource 2...
   Script: public/generated-resources/50-batch/repartidor/basic_audio_1-audio-script.txt
   Found 45 segments
   [1/45] ES: Pronunciación: Entregas Esenciales...
   [2/45] EN: Hi, I have your delivery...
   ...
   Exporting to: public/audio/resource-2.mp3
   ✅ Complete! Size: 8.23 MB, Duration: 9.45 min
   ✅ Updated metadata for Resource 2

[... continues for all 21 resources ...]

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

## Bilingual Voice Configuration

### Language Detection
The script automatically detects Spanish vs English sections:

**Spanish Indicators:**
- Words: cuando, donde, como, para, hola, gracias
- Punctuation: ¿ ¡
- Markers: `**Español:**`, `**Pronunciación:**`

**English Indicators:**
- Words: when, where, how, the, a, hello, thanks
- Markers: `**Inglés:**`, `**English:**`

### Voice Settings
- **Spanish**: `es` (closest to Colombian Spanish in gTTS)
- **English**: `en` (American English)
- **Speed**: Normal (not slow mode)
- **Pause**: 2 seconds between segments

### Audio Quality
- **Format**: MP3
- **Bitrate**: 128kbps (mobile-optimized)
- **Quality**: `-q:a 2` (high quality)
- **Target Duration**: 7-10 minutes per resource

## Validation Steps

### 1. Check File Generation
```bash
# List generated files
ls -lh public/audio/

# Should show 21 files:
# resource-2.mp3, resource-5.mp3, resource-7.mp3, etc.
```

### 2. Verify File Sizes
```bash
# Check sizes (should be 5-10 MB each)
du -h public/audio/*.mp3
```

### 3. Test Audio Playback
```bash
# Play first file (requires mpv or vlc)
mpv public/audio/resource-2.mp3
# or
vlc public/audio/resource-2.mp3
```

### 4. Validate Metadata
```bash
# Check metadata.json was updated
cat public/metadata/metadata.json | grep -A 3 "audioGenerated"
```

Expected output:
```json
{
  "id": 2,
  "audioUrl": "/audio/resource-2.mp3",
  "audioFileSize": 8.23,
  "audioDuration": 9.45,
  "audioGenerated": true
}
```

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'gtts'"
**Solution:**
```bash
pip3 install --upgrade gtts pydub
```

### Issue: "FileNotFoundError: [Errno 2] No such file or directory: 'ffmpeg'"
**Solution:** Install ffmpeg:
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from ffmpeg.org and add to PATH
```

### Issue: "Script not found" errors
**Solution:** Verify script files exist:
```bash
# Check Group 1 scripts
ls public/generated-resources/50-batch/repartidor/
ls public/generated-resources/50-batch/conductor/
ls public/generated-resources/50-batch/all/

# Check Group 2 scripts
ls public/audio-scripts/
```

### Issue: Audio sounds robotic or unnatural
**Solution:** This is a limitation of free gTTS. Options:
1. Accept current quality (sufficient for MVP)
2. Upgrade to premium service (see tts-service-comparison.md)
3. Adjust speed with `slow=True` in code

### Issue: Language detection incorrect
**Solution:** Add explicit markers to script:
```markdown
**Inglés:** Your English text here
**Español:** Tu texto en español aquí
```

### Issue: Memory errors on low-RAM systems
**Solution:** Generate one at a time:
```python
# Edit script to process single resource
RESOURCE_MAP = {
    2: "public/generated-resources/50-batch/repartidor/basic_audio_1-audio-script.txt",
}
```

## Deployment Checklist

### Before Deployment
- [ ] All 21 audio files generated successfully
- [ ] Each file is 5-10 MB (mobile-optimized)
- [ ] Total size under 200 MB
- [ ] metadata.json updated with all audioUrls
- [ ] Test playback on 3 sample files
- [ ] Verify Spanish/English sections sound natural
- [ ] Check pause timing between phrases

### Upload to Production
```bash
# Copy audio files to production server
rsync -avz public/audio/ user@server:/var/www/hablas/public/audio/

# Upload updated metadata
rsync -avz public/metadata/metadata.json user@server:/var/www/hablas/public/metadata/
```

### Verify in App
1. Open Hablas app
2. Navigate to any resource with audio
3. Click play button
4. Verify audio loads and plays correctly
5. Check Spanish and English sections are clear
6. Verify pauses between phrases

## Performance Optimization

### Reduce File Sizes
If files are too large, reduce bitrate:
```python
# In generate-tts-audio.py, line ~190
full_audio.export(
    output_path,
    format="mp3",
    bitrate="96k",  # Changed from 128k
    parameters=["-q:a", "4"]  # Changed from 2 (lower quality)
)
```

### Faster Generation
Run in parallel (requires GNU parallel):
```bash
# Generate 4 resources at a time
parallel -j 4 python3 scripts/generate-single-resource.py ::: {2,5,7,10,13,18,21,28,31,32,34,45,46,47,48,49,50,51,52}
```

## Next Steps

After successful generation:
1. Review [tts-service-comparison.md](/mnt/c/Users/brand/Development/Project_Workspace/active-development/hablas/docs/tts-service-comparison.md) for quality improvements
2. Check [tts-cost-estimate.md](/mnt/c/Users/brand/Development/Project_Workspace/active-development/hablas/docs/tts-cost-estimate.md) for budget planning
3. Consider premium TTS for production quality

## Support

For issues or questions:
- Check Troubleshooting section above
- Review gTTS documentation: https://gtts.readthedocs.io/
- File issue in project repository
