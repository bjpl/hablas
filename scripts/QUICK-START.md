# Quick Start - Audio Generation for 19 Aligned Resources

**One-command audio generation for all resources**

---

## Prerequisites (One-Time Setup)

```bash
# Install Python dependencies
pip install edge-tts pydub

# Install ffmpeg (WSL/Linux)
sudo apt update && sudo apt install ffmpeg

# Install ffmpeg (macOS)
brew install ffmpeg
```

---

## Generate Audio

### All 19 Resources (~40-50 minutes)
```bash
python scripts/generate-aligned-audio.py --all
```

### Group 1 Only (9 resources, ~20-25 minutes)
```bash
python scripts/generate-aligned-audio.py --group 1
```

### Group 2 Only (10 resources, ~22-28 minutes)
```bash
python scripts/generate-aligned-audio.py --group 2
```

### Specific Resources Only
```bash
# Single resource
python scripts/generate-aligned-audio.py --resources 2

# Multiple resources
python scripts/generate-aligned-audio.py --resources 2,5,7,10

# Emergency resources only
python scripts/generate-aligned-audio.py --resources 45,46,47,48,49,50,51,52
```

---

## Verify Output

```bash
# Count generated files (should be 19)
ls public/audio/resource-*.mp3 | wc -l

# Check total size (should be ~135 MB)
du -sh public/audio/

# List all files with sizes
ls -lh public/audio/resource-*.mp3
```

---

## Troubleshooting

**Issue**: "edge_tts module not found"
```bash
pip install edge-tts pydub
```

**Issue**: "ffmpeg not found"
```bash
# WSL/Linux
sudo apt install ffmpeg

# macOS
brew install ffmpeg
```

**Issue**: Generation fails
- Check internet connection (edge-tts requires network)
- Verify disk space (~200 MB needed)
- Check ffmpeg: `ffmpeg -version`

---

## What Gets Generated

**19 MP3 Files**:
- Resources 2, 5, 7, 10, 13, 18, 21, 28, 31, 32, 34 (11 files)
- Resources 45-52 (8 emergency resources)
- Each file: 5-10 MB, 9-12 minutes
- Total: ~135 MB, ~171 minutes

**Quality**:
- Bilingual (Colombian Spanish + American English)
- 128kbps MP3 (mobile-optimized)
- Natural pauses between phrases
- Professional voice quality

---

## Full Documentation

See `/docs/audio-regeneration-instructions.md` for:
- Complete resource mapping
- Voice configuration details
- Advanced usage options
- Performance metrics
- Troubleshooting guide

---

**Ready to generate?** Run: `python scripts/generate-aligned-audio.py --all`
