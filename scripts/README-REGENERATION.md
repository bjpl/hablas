# Audio Regeneration System

Complete system for regenerating all 55 resources (2-59) with correct voice detection.

## Quick Start

### 1. Verify Voice Detection Fix
```bash
python scripts/verify-voice-correctness.py
```

Expected output: 100% accuracy on all test cases, including the critical "customer" word boundary fix.

### 2. Regenerate All Resources
```bash
python scripts/regenerate-all-resources-final.py
```

This will:
- Process all 55 resources (2-59)
- Use FIXED voice detection with word boundaries
- Create audio files in `public/audio/`
- Log progress to `scripts/regeneration-log.txt`
- Estimated time: ~110 minutes (2 min per resource)

### 3. Regenerate Single Resource
```bash
python scripts/regenerate-single-resource.py --resource-id 7
```

Use this to:
- Fix individual resources
- Test changes
- Retry failed resources

### 4. Verify Output Only
```bash
python scripts/regenerate-single-resource.py --resource-id 7 --verify-only
```

## Key Features

### Fixed Voice Detection
The `is_spanish()` function now uses **word boundaries** to prevent false positives:

```python
# ❌ OLD (buggy):
r'(tome|deje|dejé|puedo|puede)'  # Matches "customer" → tome

# ✅ NEW (fixed):
r'\b(tome|deje|dejé|puedo|puede)\b'  # Only matches whole words
```

This fixes the critical bug where English words like "customer" were incorrectly detected as Spanish.

### Error Recovery
- Continues processing even if individual resources fail
- Logs all errors with timestamps
- Provides retry commands for failed resources
- Cleans up temp files automatically

### Progress Tracking
- Real-time console output
- Detailed log file
- Phase tracking (loading → scripting → generation → verification)
- File size and duration reporting

### Quality Verification
Each resource is verified for:
- File exists
- File size in valid range (100KB - 20MB)
- No synthesis errors
- Temp files cleaned up

## File Structure

```
scripts/
├── regenerate-all-resources-final.py    # Master script (all 55 resources)
├── regenerate-single-resource.py        # Single resource regeneration
├── verify-voice-correctness.py          # Voice detection tests
├── regeneration-log.txt                 # Detailed progress log
└── README-REGENERATION.md               # This file

public/audio/
├── resource-2.mp3                       # Generated audio files
├── resource-3.mp3
└── ...

extracted-phrases/
├── resource-2-phrases.txt               # Source phrase files
├── resource-3-phrases.txt
└── ...

audio-specs/
├── resource-2-spec.json                 # Alternative source (JSON)
├── resource-3-spec.json
└── ...
```

## Voice Configuration

### Spanish Voice
- Language: `es-US`
- Voice: `es-US-Neural2-B` (Male, Neural)
- Use: All Spanish text

### English Voice
- Language: `en-US`
- Voice: `en-US-Neural2-J` (Male, Neural)
- Use: All English text

### Audio Settings
- Format: MP3
- Bitrate: 128kbps
- Sample Rate: 44.1kHz
- Channels: Stereo
- Effects: Small Bluetooth Speaker optimization

## Monitoring Progress

### Console Output
```
🔄 Processing Resource 7
📄 Loaded 45 phrases from resource-7-phrases.txt
📄 Script saved: scripts/temp-script-7.txt
🎤 Generating audio...
  ✅ Generated: resource-7.mp3 (3.42 MB, 182.3s)
✅ Resource 7: COMPLETE
```

### Log File
Check `scripts/regeneration-log.txt` for:
- Detailed timestamps
- All errors and warnings
- Voice detection decisions
- File size and duration info

## Common Issues

### Resource Not Found
```
⚠️  No source file found for resource 42
```

**Solution**: Create phrase file or spec JSON for that resource.

### Voice Detection Error
```
❌ Incorrect voice for phrase: "customer"
```

**Solution**: Run `verify-voice-correctness.py` to test. The word boundary fix should prevent this.

### File Too Small
```
❌ File too small: 45.2 KB
```

**Solution**: Check if source file has enough content. Minimum ~10 phrases recommended.

### Rate Limit
```
ERROR synthesizing segment: Rate limit exceeded
```

**Solution**: The script includes 1-second delays. If this persists, increase delay in code.

## Resume After Interruption

If the script is interrupted, check the log to see the last successful resource:

```bash
# View last 50 lines of log
tail -50 scripts/regeneration-log.txt

# Resume from specific resource by editing RESOURCE_RANGE in script
# Change: RESOURCE_RANGE = range(2, 60)
# To:     RESOURCE_RANGE = range(25, 60)  # Start from resource 25
```

## Testing Before Full Run

**Recommended**: Test with a small batch first:

```python
# In regenerate-all-resources-final.py, change:
RESOURCE_RANGE = range(2, 60)  # All resources

# To:
RESOURCE_RANGE = range(2, 5)   # Just resources 2-4 for testing
```

## Expected Results

After successful completion:
- 55 audio files in `public/audio/` (resource-2.mp3 through resource-59.mp3)
- All files between 1-15 MB (typical)
- All durations 1-10 minutes (typical)
- No voice detection errors
- Clean log with all successes

## Performance

- **Time per resource**: ~2 minutes average
- **Total time (55 resources)**: ~110 minutes (1.8 hours)
- **Rate limiting**: 1-second delay between resources
- **Parallel processing**: Not implemented (to avoid rate limits)

## Next Steps

After regeneration:
1. **Verify**: Listen to random samples
2. **Deploy**: Copy to `out/audio/` for static export
3. **Test**: Check playback in production
4. **Monitor**: Watch for user reports

## Support

If you encounter issues:
1. Check `scripts/regeneration-log.txt` for detailed errors
2. Run `verify-voice-correctness.py` to test detection
3. Try regenerating single resource with `--resource-id`
4. Check Google Cloud TTS quota and credentials
