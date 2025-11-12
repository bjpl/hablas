# WSL Audio Generator - Quick Reference

## Quick Start

```bash
# Generate all 19 resources (~2 hours)
python scripts/generate-wsl-audio.py --all

# Generate specific resources
python scripts/generate-wsl-audio.py --resources 2,5,7,10

# Generate Group 1 (50-batch: 9 resources)
python scripts/generate-wsl-audio.py --group 1

# Generate Group 2 (audio-scripts: 10 resources)
python scripts/generate-wsl-audio.py --group 2
```

## Prerequisites

1. **WSL2** with Python 3.8+
2. **Python packages**: `pip install edge-tts pydub`
3. **FFmpeg**: Extract to `C:\ffmpeg\` (Windows side)

## Resource Groups

**Group 1 (9 resources)**: 2, 7, 10, 13, 18, 21, 28, 32, 34
- Location: `public/generated-resources/50-batch/`
- Content: Basic/intermediate delivery phrases

**Group 2 (10 resources)**: 5, 31, 45, 46, 47, 48, 49, 50, 51, 52
- Location: `public/audio-scripts/`
- Content: Emergency procedures, conflicts, situations

## Output

- **Location**: `public/audio/resource-{id}.mp3`
- **Format**: MP3, 128kbps, 24kHz, Mono
- **Size**: 3-8 MB per file
- **Duration**: 3-8 minutes per file

## Features

- ✅ WSL-compatible ffmpeg wrapper setup
- ✅ Automatic language detection (Spanish/English)
- ✅ Colombian Spanish + US English voices
- ✅ Appropriate pauses (1s English, 0.5s Spanish)
- ✅ Content filtering (removes headers/metadata)
- ✅ Batch processing with error recovery
- ✅ Detailed progress reporting

## Testing

```bash
# Test with one resource first
python scripts/generate-wsl-audio.py --resources 2

# Verify output
ls -lh public/audio/resource-2.mp3
```

Expected output: `7.1M` file, ~7.7 minutes duration

## Troubleshooting

**ffmpeg not found**:
```bash
# Verify Windows ffmpeg
/mnt/c/ffmpeg/bin/ffmpeg.exe -version

# Script auto-creates wrapper on first run
```

**Permission denied**:
```bash
chmod +x scripts/generate-wsl-audio.py
chmod +x ~/bin/ffmpeg ~/bin/ffprobe
```

## Full Documentation

See: `docs/wsl-audio-generator-guide.md` for complete documentation

## Status

✅ **Production Ready**
- Tested with Resource 2 (7.1 MB, 7.7 minutes)
- Ready for full batch generation (19 resources)
- Replaces: `generate-aligned-audio.py`
