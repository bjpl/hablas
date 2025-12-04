# Batch Regeneration Quick Start Guide

**Goal:** Regenerate 7 incomplete resources with full phrase coverage
**Time:** ~1.5 hours
**Resources:** 22, 23, 25, 29, 30, 31, 33

---

## Prerequisites

```bash
# Install edge-tts for Azure TTS (free alternative)
pip install edge-tts

# Or use Azure TTS directly (requires subscription)
# Set AZURE_TTS_KEY and AZURE_TTS_REGION environment variables
```

---

## Quick Execution

### Option 1: Full Batch Regeneration

```bash
# Run all 7 resources
python scripts/batch-regenerate-incomplete.py

# Estimated time: 86 minutes
```

### Option 2: Batch-by-Batch (Recommended)

```bash
# Batch 1: Basic resources (22, 23, 29)
python scripts/batch-regenerate-incomplete.py --batch 1

# Review results, then proceed to Batch 2
# Batch 2: Intermediate resources (25, 30, 31, 33)
python scripts/batch-regenerate-incomplete.py --batch 2
```

### Option 3: Single Resource Testing

```bash
# Test with highest priority resource first
python scripts/batch-regenerate-incomplete.py --resource-id 23

# If successful, proceed with full batch
```

---

## Verification Only

```bash
# Check existing audio files without regenerating
python scripts/batch-regenerate-incomplete.py --verify-only
```

---

## What the Script Does

For each resource:

1. **Extract Phrases** - Pulls all phrases from markdown source files
2. **Create Script** - Generates compact tutorial script (like resource-2)
3. **Generate Audio** - Uses Azure TTS to create MP3 file
4. **Verify** - Checks file size, format, completeness

---

## Output Files

```
audio-specs/
├── resource-22-compact.txt    # Tutorial script
├── resource-23-compact.txt
├── resource-25-compact.txt
├── resource-29-compact.txt
├── resource-30-compact.txt
├── resource-31-compact.txt
└── resource-33-compact.txt

out/audio/
├── resource-22.mp3            # Generated audio
├── resource-23.mp3
├── resource-25.mp3
├── resource-29.mp3
├── resource-30.mp3
├── resource-31.mp3
└── resource-33.mp3
```

---

## After Regeneration

```bash
# 1. Copy audio to public folder
cp out/audio/resource-{22,23,25,29,30,31,33}.mp3 public/audio/

# 2. Update service worker cache version
# Edit public/service-worker.js - increment CACHE_VERSION

# 3. Build and verify
npm run build

# 4. Test in browser
npm run dev
# Open http://localhost:3000/recursos/23 (highest priority)

# 5. Deploy
npm run deploy
```

---

## Troubleshooting

### "edge-tts not found"

```bash
pip install edge-tts
# Or use pip3 on some systems
```

### "Markdown file not found"

Check that source files exist:
```bash
ls generated-resources/50-batch/all/basic_time_1.md
ls generated-resources/50-batch/all/basic_numbers_1.md
```

### "No phrases extracted"

The script tries multiple markdown patterns. If extraction fails:
1. Check script was created: `audio-specs/resource-{ID}-compact.txt`
2. Manually review markdown format
3. Adjust extraction patterns in script if needed

### "Audio file too small"

- Check Azure TTS API key is set
- Verify script content is complete
- Try regenerating single resource with `--resource-id`

---

## Manual Alternative

If automated generation fails, you can use the generated scripts manually:

```bash
# Scripts are created even if audio generation fails
# Located in: audio-specs/resource-{ID}-compact.txt

# Use any TTS service:
# - Azure Speech Studio
# - Google Cloud TTS
# - Amazon Polly
# - elevenlabs.io

# Then place MP3 files in: out/audio/resource-{ID}.mp3
```

---

## Resource Priority Order

If time is limited, process in this order:

1. **Resource 23** (CRITICAL - 15 missing phrases)
2. **Resource 22** (HIGH - 12 missing phrases)
3. **Resources 25, 29, 30** (MEDIUM - 10 missing phrases each)
4. **Resources 31, 33** (MEDIUM - 9 missing phrases each)

---

## Success Verification

After regeneration, verify:

```bash
# Check all audio files exist
ls -lh out/audio/resource-{22,23,25,29,30,31,33}.mp3

# Verify file sizes (should be 2-10 MB each)
du -h out/audio/resource-{22,23,25,29,30,31,33}.mp3

# Test one audio file
# mpg123 out/audio/resource-23.mp3
# Or open in browser: http://localhost:3000/recursos/23
```

---

## Time Estimates

- **Batch 1** (22, 23, 29): ~30 minutes
- **Batch 2** (25, 30, 31, 33): ~45 minutes
- **Verification**: ~10 minutes
- **Build & Deploy**: ~5 minutes

**Total:** ~90 minutes

---

## Need Help?

See full documentation: `docs/BATCH_REGENERATION_PLAN.md`
