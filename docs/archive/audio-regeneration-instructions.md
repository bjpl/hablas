# Audio Regeneration Instructions - 19 Aligned Resources (+ 2 Pending)

**Date**: November 11, 2025
**Script**: `/scripts/generate-aligned-audio.py`
**Status**: Production-Ready
**Current Resources**: 19 mapped (+ 2 visual resources pending ID assignment)

---

## Overview

This guide explains how to regenerate MP3 audio files for all 19 aligned resources using the edge-tts (Microsoft Edge TTS) system.

**Note**: 2 additional visual resources exist (`basic_visual_1` and `basic_visual_2`) but are awaiting resource ID assignment.

---

## Prerequisites

### 1. Python Dependencies
```bash
pip install edge-tts pydub
```

### 2. System Requirements

**Windows (WSL):**
```bash
# Install ffmpeg in WSL
sudo apt update
sudo apt install ffmpeg

# Verify installation
ffmpeg -version
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

---

## Resource Mapping (19 Total + 2 Pending)

### Group 1: 50-Batch Resources (9 files)
Located in: `/public/generated-resources/50-batch/`

| ID | Category | File |
|----|----------|------|
| 2  | Repartidor | `repartidor/basic_audio_1-audio-script.txt` |
| 7  | Repartidor | `repartidor/basic_audio_2-audio-script.txt` |
| 10 | Repartidor | `repartidor/intermediate_conversations_1-audio-script.txt` |
| 32 | Repartidor | `repartidor/intermediate_conversations_2-audio-script.txt` |
| 13 | Conductor | `conductor/basic_audio_navigation_1-audio-script.txt` |
| 18 | Conductor | `conductor/basic_audio_navigation_2-audio-script.txt` |
| 34 | Conductor | `conductor/intermediate_audio_conversations_1-audio-script.txt` |
| 21 | All | `all/basic_greetings_all_1-audio-script.txt` |
| 28 | All | `all/basic_greetings_all_2-audio-script.txt` |

### Group 2: Audio Scripts Resources (10 files)
Located in: `/public/audio-scripts/`

| ID | Category | File |
|----|----------|------|
| 5  | Intermediate | `intermediate_situations_1-audio-script.txt` |
| 31 | Intermediate | `intermediate_situations_2-audio-script.txt` |
| 45 | Emergency | `accident-procedures-audio-script.txt` |
| 46 | Emergency | `customer-conflict-audio-script.txt` |
| 47 | Emergency | `lost-or-found-items-audio-script.txt` |
| 48 | Emergency | `medical-emergencies-audio-script.txt` |
| 49 | Emergency | `payment-disputes-audio-script.txt` |
| 50 | Emergency | `safety-concerns-audio-script.txt` |
| 51 | Emergency | `vehicle-breakdown-audio-script.txt` |
| 52 | Emergency | `weather-hazards-audio-script.txt` |

### Pending Resources (2 files awaiting ID assignment)
Located in: `/public/audio-scripts/`

| ID | Category | File | Status |
|----|----------|------|--------|
| TBD | Visual | `basic_visual_1-audio-script.txt` | File exists, awaiting resource ID |
| TBD | Visual | `basic_visual_2-audio-script.txt` | File exists, awaiting resource ID |

---

## Usage

### Generate All 19 Resources
```bash
python scripts/generate-aligned-audio.py --all
```

**Output**: 19 MP3 files in `/public/audio/`
**Duration**: ~30-40 minutes (depending on network speed)
**Size**: ~135 MB total (19 resources)

---

### Generate Specific Resources
```bash
# Single resource
python scripts/generate-aligned-audio.py --resources 2

# Multiple resources
python scripts/generate-aligned-audio.py --resources 2,5,7,10

# Emergency resources only
python scripts/generate-aligned-audio.py --resources 45,46,47,48,49,50,51,52
```

---

### Generate by Group
```bash
# Group 1: 50-batch resources (9 files)
python scripts/generate-aligned-audio.py --group 1

# Group 2: Audio scripts (10 files)
python scripts/generate-aligned-audio.py --group 2
```

---

## Voice Configuration

### Spanish Voices (Colombian)
- **Female**: `es-CO-SalomeNeural`
- **Male**: `es-CO-GonzaloNeural`

### English Voices (American)
- **Female**: `en-US-JennyNeural`
- **Male**: `en-US-GuyNeural`

### Voice Assignment Strategy
The script automatically assigns voices based on resource ID:
- Resources with known voices use their established assignments
- New resources alternate between male/female for variety
- All voices are Colombian Spanish + American English

---

## Audio Quality Settings

### Edge-TTS Configuration
```python
rate = "-20%"          # Slower speech for learning
bitrate = "128k"       # Mobile-optimized
pause_english = 1000ms # 1 second after English
pause_spanish = 500ms  # 0.5 seconds after Spanish
```

### Output Specifications
- **Format**: MP3
- **Bitrate**: 128kbps
- **Quality**: High (mobile-optimized)
- **Size**: 5-10 MB per resource
- **Duration**: 9-12 minutes per resource

---

## How It Works

### 1. Script Processing
The script reads the text file and:
- Removes all formatting (headers, dividers, metadata)
- Filters out duplicate lines
- Extracts only spoken content
- Keeps tips/notes for narration

### 2. Language Detection
Automatic detection using:
- Spanish characters (á, é, í, ó, ú, ñ, ¿, ¡)
- Spanish keywords (hola, gracias, tengo, etc.)
- English keywords (hello, thank, please, etc.)
- Fallback to English for unclear content

### 3. Audio Generation
For each line:
- Detect language
- Select appropriate voice
- Generate audio segment
- Add pause (1s for English, 0.5s for Spanish)
- Concatenate all segments
- Export as single MP3

---

## Troubleshooting

### Issue: "edge_tts module not found"
```bash
pip install edge-tts pydub
```

### Issue: "ffmpeg not found" in WSL
```bash
# In WSL
sudo apt update
sudo apt install ffmpeg

# Verify
ffmpeg -version
```

### Issue: "Script file not found"
**Check**:
1. File path is correct in `RESOURCE_PATHS`
2. File exists at specified location
3. Working directory is project root

### Issue: Generation fails midway
**Solution**:
1. Check internet connection (edge-tts requires online access)
2. Verify ffmpeg is installed
3. Check disk space (~200 MB needed)

### Issue: Audio quality issues
**Check**:
1. Bitrate setting (should be 128k)
2. Rate setting (should be -20% for learning pace)
3. Input text quality (clean, well-formatted)

---

## Output

### File Structure
```
public/audio/
├── resource-2.mp3   (7-10 MB)
├── resource-5.mp3   (7-10 MB)
├── resource-7.mp3   (7-10 MB)
├── resource-10.mp3  (7-10 MB)
├── resource-13.mp3  (7-10 MB)
├── resource-18.mp3  (7-10 MB)
├── resource-21.mp3  (7-10 MB)
├── resource-28.mp3  (7-10 MB)
├── resource-31.mp3  (7-10 MB)
├── resource-32.mp3  (7-10 MB)
├── resource-34.mp3  (7-10 MB)
├── resource-45.mp3  (7-10 MB)
├── resource-46.mp3  (7-10 MB)
├── resource-47.mp3  (7-10 MB)
├── resource-48.mp3  (7-10 MB)
├── resource-49.mp3  (7-10 MB)
├── resource-50.mp3  (7-10 MB)
├── resource-51.mp3  (7-10 MB)
└── resource-52.mp3  (7-10 MB)

Total: ~135 MB, ~171 minutes of audio (19 resources)
```

**Note**: 2 additional visual resources will be added once resource IDs are assigned.

---

## Validation

### After Generation
```bash
# Check all files were created
ls -lh public/audio/resource-*.mp3

# Count files (should be 19)
ls public/audio/resource-*.mp3 | wc -l

# Check total size (should be ~135 MB for 19 resources)
du -sh public/audio/
```

### Test Audio Quality
```bash
# Play a sample file
ffplay public/audio/resource-2.mp3

# Check audio info
ffprobe public/audio/resource-2.mp3
```

---

## Performance

### Expected Generation Times
- **Single resource**: ~2-3 minutes
- **Group 1 (9 resources)**: ~20-25 minutes
- **Group 2 (10 resources)**: ~22-28 minutes
- **All 19 resources**: ~40-50 minutes

### Resource Usage
- **CPU**: Moderate (audio processing)
- **Memory**: ~500 MB peak
- **Disk**: ~200 MB temporary space
- **Network**: Required (edge-tts API calls)

---

## Future Enhancements

### Planned Features
1. **Progress bar**: Real-time generation progress
2. **Resume capability**: Continue from failed resource
3. **Parallel generation**: Process multiple resources simultaneously
4. **Quality presets**: Quick/standard/premium quality options
5. **Voice customization**: User-selectable voices per resource

### Pending Visual Resources
Two visual resource files exist and are ready for audio generation once resource IDs are assigned:
- `basic_visual_1-audio-script.txt` (7.8 KB, Beginner level)
- `basic_visual_2-audio-script.txt` (8.0 KB, Beginner level)

**To add these resources**:
1. Assign resource IDs (recommend 53, 54)
2. Update `RESOURCE_PATHS` in script
3. Regenerate audio with `--resources 53,54`

---

## Support

### Issues
Report problems with:
1. Resource ID
2. Error message
3. Input file path
4. Expected vs actual output

### Documentation
- **TTS Guide**: `/docs/tts-generation-guide.md`
- **Service Comparison**: `/docs/tts-service-comparison.md`
- **Cost Analysis**: `/docs/tts-cost-estimate.md`
- **System Overview**: `/docs/TTS-SYSTEM-DELIVERY.md`

---

## Quick Reference

```bash
# Generate all resources
python scripts/generate-aligned-audio.py --all

# Generate Group 1 (50-batch)
python scripts/generate-aligned-audio.py --group 1

# Generate Group 2 (audio-scripts)
python scripts/generate-aligned-audio.py --group 2

# Generate specific resources
python scripts/generate-aligned-audio.py --resources 2,5,7

# Check output
ls -lh public/audio/resource-*.mp3
```

---

**Script Status**: ✅ Production-Ready
**Last Updated**: November 11, 2025
**Maintainer**: Development Team
