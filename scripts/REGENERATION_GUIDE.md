# Complete Audio Regeneration Guide

## Script: `regenerate-from-source-complete.py`

This is the **definitive script** to regenerate all 56 resources with the correct compact tutorial format.

## Features

### Compact Tutorial Format
Each phrase follows this structure (~20-25 seconds total):

1. **Context** (Spanish): "Frase número uno." (~2s)
2. **English phrase** (slow, -20% speed): ~3s
3. **PAUSE**: 1 second
4. **English repeat** (slow, -20% speed): ~3s
5. **PAUSE**: 1 second
6. **Spanish translation**: ~3s
7. **PAUSE: 2.5 seconds** ← **CRITICAL: For learner repetition**
8. Between phrases: 1.5s pause

### Full Audio Structure

```
1. Introduction (~30 seconds)
   "¡Hola! Bienvenido a Hablas. En los próximos minutos vas a aprender N frases..."

2. For EACH phrase (~20-25s each)
   - Brief context (Spanish)
   - English phrase (slow)
   - [1s pause]
   - English phrase repeat (slow)
   - [1s pause]
   - Spanish translation
   - [2.5s pause for learner repetition] ← THE KEY FEATURE

3. Practice section (~1 minute)
   "¡Ahora practica! Repite después de cada frase."
   [All English phrases at normal speed with 2.5s pauses]

4. Conclusion (~30 seconds)
   "¡Excelente! Acabas de aprender N frases. Practica dos veces al día..."
```

## Voice Configuration

**CONSISTENT across ALL resources:**

- **Spanish**: `es-CO-SalomeNeural` (Colombian Spanish, neutral)
- **English**: `en-US-JennyNeural` (US English, clear)
- **English speed**: -20% (slower for learning)
- **Spanish speed**: 0% (normal)

## Prerequisites

```bash
# Install edge-tts (required)
pip install edge-tts

# Install pydub (required)
pip install pydub

# FFmpeg (required by pydub)
# Ubuntu/Debian: sudo apt-get install ffmpeg
# macOS: brew install ffmpeg
# Windows: Download from ffmpeg.org
```

## Usage

### Regenerate All 56 Resources

```bash
cd /mnt/c/Users/brand/Development/Project_Workspace/active-development/hablas
python scripts/regenerate-from-source-complete.py
```

### What It Does

1. **Reads `resource-master-mapping.json`** to identify all resources
2. **Finds source files** for each resource:
   - Markdown files (`.md`)
   - Audio scripts (`.txt`)
   - Spec JSON files (`.json`)
3. **Extracts English/Spanish phrase pairs** from source
4. **Generates audio** with:
   - Introduction section
   - Each phrase with pauses
   - Practice section
   - Conclusion section
5. **Exports to `public/audio/resource-{id}.mp3`**
6. **Logs progress** to `scripts/complete-regeneration-log.txt`

## Key Improvements

### 1. Fixed Voice Detection
Uses **word boundaries** to prevent false positives:

```python
# ✅ CORRECT: "customer" won't trigger "tome" pattern
r'\b(tome|deje|dejé|puedo|puede)\b'

# ❌ OLD: "customer" would trigger this
r'(tome|deje|dejé|puedo|puede)'
```

### 2. Repetition Pause
After each Spanish translation, adds **2.5 seconds** for learner to repeat:

```python
PAUSE_AFTER_SPANISH = 2500  # 2.5 seconds for learner repetition
```

This is the **critical feature** that makes the audio effective for learning.

### 3. Phrase Extraction
Handles all source types:

- **Markdown**: Parses `## Frase N:` sections
- **Audio scripts**: Parses structured format
- **Spec JSON**: Extracts from segments array

### 4. Consistent Quality
- Same voices for all resources
- Same timing pattern
- Same pause durations
- Same audio quality (128kbps, 44.1kHz, stereo)

## Output

### Generated Files
```
public/audio/
  resource-1.mp3
  resource-2.mp3
  resource-4.mp3
  ...
  resource-59.mp3
```

### Log File
```
scripts/complete-regeneration-log.txt
```

Contains:
- Timestamp for each operation
- Phrases extracted per resource
- Audio generation progress
- File size and duration
- Success/failure status

## Verification

The script automatically verifies each generated file:

- ✅ File exists
- ✅ File size > 100KB
- ✅ Audio duration calculated
- ✅ Format is valid MP3

## Typical Output

```
================================================================================
🚀 DEFINITIVE REGENERATION - ALL 56 RESOURCES
================================================================================
📅 Started: 2025-11-10 21:00:00

✅ Loaded mapping for 56 resources

============================================================
🔄 Processing Resource 2
============================================================
  📄 Source: basic_audio_1-audio-script.txt
  ✓ Extracted 8 phrase pairs
  🎤 Generating introduction...
  🎤 Generating 8 phrases...
    ✓ 5/8 phrases generated
  🎤 Generating practice section...
  🎤 Generating conclusion...
  ✅ Generated: resource-2.mp3 (4.52 MB, 195.3s)
  ✅ Resource 2 COMPLETE

[... continues for all 56 resources ...]

================================================================================
📊 REGENERATION SUMMARY
================================================================================
✅ Successful: 56 resources
❌ Failed: 0 resources
⏱️  Total time: 38.5 minutes

✅ Successful: 1, 2, 4, 5, 6, 7, 9, 10, ...

📋 Full log: scripts/complete-regeneration-log.txt
================================================================================
```

## Estimated Time

- **Per resource**: ~30-60 seconds
- **All 56 resources**: ~30-45 minutes
- Depends on internet speed (edge-tts is cloud-based)

## Error Recovery

If a resource fails:

1. Check `complete-regeneration-log.txt` for details
2. Verify source file exists
3. Check phrase extraction worked
4. Re-run script (it will overwrite)

## Notes

- **Edge-TTS is cloud-based**: Requires internet connection
- **Rate limits**: Script includes 0.5s delay between resources
- **Temp files**: Automatically cleaned up after each phrase
- **Overwrite mode**: Will replace existing audio files

## Troubleshooting

### "edge-tts not installed"
```bash
pip install edge-tts
```

### "No source file found"
Check that `resource-master-mapping.json` has correct `source_file` entry.

### "FFmpeg not found"
Install FFmpeg (required by pydub for audio processing).

### Audio too quiet/loud
Adjust in pydub export parameters (currently uses defaults).

## Next Steps

After regeneration:

1. **Test audio files**: Play a few samples
2. **Check timing**: Verify pauses are correct length
3. **Deploy to production**: Copy to `out/audio/` for Next.js build
4. **Update service worker**: Bump cache version if needed

---

**Created**: 2025-11-10
**Author**: FinalRegenerationAgent
**Purpose**: Complete audio regeneration with repetition pauses
