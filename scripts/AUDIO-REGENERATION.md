# Audio Regeneration Guide

## ✅ COMPLETED - All Audio Files Regenerated!

**Text Scripts:** ✅ CLEAN - All production directions removed
**Audio Files:** ✅ REGENERATED - Clean audio with edge-tts (Microsoft Edge Neural TTS)
**Cleaned Scripts:** ✅ AVAILABLE - In `scripts/cleaned-audio-scripts/`

**Date Completed:** October 31, 2025
**Method Used:** Microsoft Edge Neural TTS (edge-tts)

## Problem

The current MP3 files were generated from scripts that contained production directions like:
- `**[Speaker: English native - 80% speed]**`
- `**[Tone: Professional, friendly]**`
- `**[Pause: 3 seconds]**`
- Timestamp markers
- Metadata headers

These directions are being read aloud in the audio, making them confusing for users.

## Solution

### 1. Cleaned Scripts Available

All 9 audio resources have been cleaned and exported to:
```
scripts/cleaned-audio-scripts/
├── resource-2-clean.txt   (4.6KB) - Colombian Spanish
├── resource-7-clean.txt   (4.8KB) - Colombian Spanish
├── resource-10-clean.txt  (9.7KB) - Mexican Spanish
├── resource-13-clean.txt  (7.5KB) - American English
├── resource-18-clean.txt  (7.5KB) - American English
├── resource-21-clean.txt  (6.8KB) - Colombian Spanish
├── resource-28-clean.txt  (4.6KB) - Colombian Spanish
├── resource-32-clean.txt  (4.9KB) - Mexican Spanish
└── resource-34-clean.txt  (12KB)  - American English
```

### 2. Generation Script Updated

`scripts/generate-audio-gtts.py` has been updated to:
- Use the cleaned scripts
- Remove all production directions
- Add delays to avoid rate limits

### 3. How to Regenerate

**When gTTS API rate limits clear** (usually 24 hours):

```bash
python scripts/generate-audio-gtts.py
```

This will:
- Read cleaned scripts
- Generate MP3 files with clean content
- Update metadata.json
- Save to public/audio/

### 4. Alternative: Manual Upload

If you have access to a TTS service (ElevenLabs, Azure, AWS Polly):
1. Use the cleaned scripts in `scripts/cleaned-audio-scripts/`
2. Generate audio files
3. Save as `public/audio/resource-{id}.mp3`
4. Update `public/audio/metadata.json`

## What's Fixed Now

✅ Text scripts on website - clean, no production directions
✅ Cleaned audio scripts exported - ready for TTS
✅ Generation script updated - will create clean audio
⏳ MP3 files - need regeneration when API allows

## ✅ Completed Successfully

All 9 audio files have been successfully regenerated using edge-tts:

```bash
python scripts/generate-audio-edge.py
```

**Results:**
- ✅ 9/9 files generated successfully
- ✅ No production directions being read
- ✅ High-quality neural voices
- ✅ Colombian, Mexican, and US accents
- ✅ All committed and pushed to repository

## Future Regeneration

To regenerate audio files in the future:

```bash
# Recommended: Use edge-tts (no rate limits, high quality)
python scripts/generate-audio-edge.py

# Alternative: Use gTTS (may have rate limits)
python scripts/generate-audio-gtts.py
```

## Cleaned Content Example

**Before (in old audio):**
```
[Pause: 2 seconds] Speaker: Spanish narrator - friendly voice
¡Hola, repartidor!
```

**After (in new audio):**
```
¡Hola, repartidor! Bienvenido a Hablas.
Soy tu instructor de inglés para domiciliarios.
```

Much cleaner and more professional!
