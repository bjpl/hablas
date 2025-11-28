# Next Steps: Audio Generation for Resources 1-37

## Current Status ✅

**COMPLETED**:
- ✅ Extracted ACTUAL phrases from 22 resources
- ✅ Created proper dual-voice audio scripts
- ✅ Cleaned formatting artifacts
- ✅ Backed up old placeholder files
- ✅ Verified content quality

**LOCATION**: `scripts/final-phrases-only/resource-{1-37}.txt`

---

## Ready for Audio Generation

### Resources with Corrected Phrases (22 files)

These files are ready for ElevenLabs dual-voice audio generation:

**Delivery Resources**:
- resource-1.txt (50 phrases - Basic delivery)
- resource-4.txt (69 phrases - Basic delivery v2)
- resource-5.txt (35 phrases - Complex situations ⭐)
- resource-6.txt (71 phrases - Basic delivery v3)
- resource-9.txt (63 phrases - Basic delivery v4)
- resource-31.txt (23 phrases - Complex situations v2)

**Rideshare Resources**:
- resource-11.txt (56 phrases - Greetings v1)
- resource-14.txt (58 phrases - Greetings v2)
- resource-17.txt (71 phrases - Greetings v3)
- resource-16.txt (54 phrases - Small talk)
- resource-33.txt (61 phrases - Conversations)

**Navigation Resources**:
- resource-12.txt (41 phrases - GPS v1)
- resource-15.txt (34 phrases - GPS v2)
- resource-19.txt (43 phrases - GPS v3)

**Professional Resources**:
- resource-20.txt (26 phrases - Difficult situations)
- resource-25.txt (43 phrases - Customer service)
- resource-26.txt (40 phrases - Complaints handling)

**Emergency Resources**:
- resource-27.txt (47 phrases - Emergency phrases)
- resource-30.txt (25 phrases - Safety protocols)

**Practical Resources**:
- resource-22.txt (24 phrases - Numbers)
- resource-23.txt (76 phrases - Time)
- resource-29.txt (29 phrases - Numbers v2)

---

## Audio Generation Steps

### 1. Setup ElevenLabs API
```bash
# Set API key
export ELEVEN_LABS_API_KEY="your_key_here"
```

### 2. Generate Audio for Priority Resources

**High Priority** (Complex situations - most value):
```bash
# Generate resource 5 (Complex delivery situations)
node scripts/generate-audio.js --resource 5 --voice-native charlotte --voice-spanish Daniela

# Generate resource 31 (Complex situations v2)
node scripts/generate-audio.js --resource 31 --voice-native charlotte --voice-spanish Daniela
```

**Medium Priority** (Professional skills):
```bash
# Customer service
node scripts/generate-audio.js --resource 25 --voice-native charlotte --voice-spanish Daniela

# Complaints handling
node scripts/generate-audio.js --resource 26 --voice-native charlotte --voice-spanish Daniela

# Emergency phrases
node scripts/generate-audio.js --resource 27 --voice-native charlotte --voice-spanish Daniela
```

**Low Priority** (Basic phrases - batch process):
```bash
# Generate all basic delivery resources
for i in 1 4 6 9; do
  node scripts/generate-audio.js --resource $i --voice-native charlotte --voice-spanish Daniela
done
```

### 3. Verify Generated Audio
```bash
# Check audio file quality
node scripts/verify-audio.js --resource 5

# Listen to first 30 seconds
ffmpeg -i public/audio/resource-5.mp3 -t 30 preview-5.mp3
```

### 4. Update Resources
```bash
# Update audioUrl in resources.ts (already done if using /audio/resource-{id}.mp3)
# Or run update script if needed
node scripts/update-audio-urls.ts
```

---

## Audio Script Resources to Review (10 files)

These resources point to existing .txt audio scripts - verify they have correct content:

```
Resource 2:  basic_audio_1-audio-script.txt
Resource 7:  basic_audio_2-audio-script.txt
Resource 10: intermediate_conversations_1-audio-script.txt
Resource 13: basic_audio_navigation_1-audio-script.txt
Resource 18: basic_audio_navigation_2-audio-script.txt
Resource 21: basic_greetings_all_1-audio-script.txt
Resource 28: basic_greetings_all_2-audio-script.txt
Resource 32: intermediate_conversations_2-audio-script.txt
Resource 34: intermediate_audio_conversations_1-audio-script.txt
```

**Action**: Check if these need to be regenerated from their parent markdown files or if they already have correct content.

---

## Testing Checklist

After audio generation:

- [ ] Resource 5 audio plays correctly
- [ ] English voice is clear and native
- [ ] Spanish voice is clear and native
- [ ] Phrases alternate correctly (English 2x, then Spanish)
- [ ] No audio artifacts or glitches
- [ ] Duration is 2-4 minutes per resource
- [ ] All 22 resources have audio files
- [ ] Audio URLs load in application
- [ ] Download functionality works offline

---

## Expected Results

### Audio Duration
- **20 phrases per resource** × **~6 seconds per phrase** = **~2 minutes**
- Acceptable range: 1.5 - 4 minutes

### File Sizes
- Expected: 1-3 MB per MP3 file
- Total for 22 resources: ~20-60 MB

### Quality
- Bitrate: 128 kbps (good quality, reasonable size)
- Format: MP3 (universal compatibility)
- Sample rate: 44.1 kHz (standard audio)

---

## Rollback Plan

If issues occur:

1. **Backup exists**: `scripts/final-phrases-only-backup/`
2. **Restore placeholders**: 
   ```bash
   cp scripts/final-phrases-only-backup/* scripts/final-phrases-only/
   ```
3. **Keep new files**: Both versions preserved
4. **No data loss**: All original files safe

---

## Success Criteria

✅ Audio generated for all 22 extracted resources
✅ Quality verified (clear voices, no artifacts)
✅ Duration appropriate (2-4 minutes)
✅ Files load in application
✅ Offline functionality works
✅ Users can learn actual complex scenarios

---

## Timeline Estimate

- **Audio generation**: 30-60 minutes (22 files × 2-3 min per file)
- **Quality verification**: 15-30 minutes
- **Testing in app**: 15-30 minutes
- **Total**: 1-2 hours

---

## Priority Order

1. **Resource 5** (Complex delivery - highest value)
2. **Resource 31** (Complex delivery v2)
3. **Resource 27** (Emergency phrases)
4. **Resource 25, 26** (Customer service)
5. **Resources 1, 4, 6, 9** (Basic delivery - batch)
6. **Remaining 12 resources** (batch process)

---

**Status**: Ready for audio generation
**Date**: 2025-11-02
**Extraction Complete**: ✅
**Next Step**: Generate MP3 files with ElevenLabs
