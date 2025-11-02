# Audio Generation Guide - Hablas Platform

## Production System (Current)

### Technology Stack
- **Primary TTS Engine**: Microsoft Edge TTS (`edge-tts`)
- **Audio Processing**: pydub with FFmpeg
- **Voice Quality**: Neural voices with Colombian/Mexican Spanish and American English
- **Output Format**: MP3 at 128kbps

### Production Script
**`generate-dual-voice-pydub.py`** - The canonical audio generation system

This script:
1. Reads cleaned audio scripts (dialogue only, no production markers)
2. Detects language of each text segment (Spanish vs English)
3. Generates audio with native voices for each language
4. Concatenates segments with natural pauses using pydub
5. Exports single MP3 file per resource

### Voice Configuration

Resources use paired Spanish/English voices:

| Resource ID | Spanish Voice | English Voice |
|-------------|---------------|---------------|
| 2, 13, 21 | es-CO-SalomeNeural (Colombian female) | en-US-JennyNeural (American female) |
| 7, 28, 34 | es-CO-GonzaloNeural (Colombian male) | en-US-GuyNeural (American male) |
| 10, 18, 32 | es-MX-DaliaNeural (Mexican female) | en-US-JennyNeural (American female) |

All other resources (1-37): Use default voices with template dialogue

### Audio Format

**Input (Cleaned Scripts)**:
```
Hi, I have your delivery

Hi, I have your delivery

Hola, tengo su entrega

Thank you

Thank you

Gracias
```

**Processing**:
- English lines → American English voice + 1000ms pause
- Spanish lines → Colombian/Mexican Spanish voice + 500ms pause
- -20% playback rate for learners

**Output**:
- Single MP3 file: `public/audio/resource-{id}.mp3`
- Typical size: 500KB - 10MB depending on content

## Dependencies

### Required Packages
```bash
pip install edge-tts pydub
```

### System Requirements
- **FFmpeg** must be installed and in PATH
  - Windows: Install FFmpeg to `C:\ffmpeg\bin`
  - The script adds this to PATH automatically
  - Download: https://ffmpeg.org/download.html

## Usage

### Generate All Audio Files (Production)
```bash
python scripts/generate-dual-voice-pydub.py
```

This generates all 37 bilingual audio resources:
- Resources with source scripts: Uses cleaned dialogue
- Resources without source scripts: Uses template dialogue
- Output: `public/audio/resource-1.mp3` through `resource-37.mp3`

### Test Mode (Recommended First)
```bash
python scripts/generate-dual-voice-pydub.py --test
```

Generates only `resource-2.mp3` with first 3 phrases for quality verification.

### Monitoring Progress
The script provides real-time feedback:
```
🎙️  Resource 2: basic_audio_1-audio-script.txt
   Spanish Voice: es-CO-SalomeNeural
   English Voice: en-US-JennyNeural
   [1/45] EN: Hi, I have your delivery...
   [2/45] EN: Hi, I have your delivery...
   [3/45] SP: Hola, tengo su entrega...
   🔄 Concatenating 90 segments...
   💾 Exporting to public/audio/resource-2.mp3...
   ✅ COMPLETE: 9.2 MB
```

## Input Files

### Cleaned Audio Scripts
Location: `scripts/cleaned-audio-scripts/`

Available scripts:
- `basic_audio_1-audio-script.txt` (Resource 2)
- `basic_audio_2-audio-script.txt` (Resource 7)
- `intermediate_conversations_1-audio-script.txt` (Resource 10)
- `basic_audio_navigation_1-audio-script.txt` (Resource 13)
- `basic_audio_navigation_2-audio-script.txt` (Resource 18)
- `basic_greetings_all_1-audio-script.txt` (Resource 21)
- `basic_greetings_all_2-audio-script.txt` (Resource 28)
- `intermediate_conversations_2-audio-script.txt` (Resource 32)
- `intermediate_audio_conversations_1-audio-script.txt` (Resource 34)

### Template Fallback
Resources without source scripts use a standard template:
```
Hi, I have your delivery / Hola, tengo su entrega
Thank you / Gracias
Have a great day / Que tenga un gran día
```

## Architecture

### Language Detection
The script uses regex patterns to identify Spanish vs English:

**Spanish Indicators**:
- Special characters: ¿ ¡ á é í ó ú ü ñ
- Keywords: hola, tengo, su, entrega, español, frase

**English Indicators**:
- Keywords: delivery, order, customer, thank, please, have

### Audio Processing Pipeline
1. **Parse**: Split script into lines
2. **Detect**: Determine language per line
3. **Generate**: Create audio segment with appropriate voice
4. **Pause**: Add 1000ms (English) or 500ms (Spanish)
5. **Concatenate**: Combine all segments
6. **Export**: Save as MP3 at 128kbps

### Error Handling
- Missing scripts: Falls back to template
- Generation failures: Skips segment and continues
- Segment loading errors: Logged and skipped
- Temp files: Cleaned up automatically

## Common Issues

### Issue: "No module named 'edge_tts'"
**Solution**:
```bash
pip install edge-tts
```

### Issue: "ffmpeg not found"
**Solution**:
1. Download FFmpeg from https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg\`
3. Ensure `C:\ffmpeg\bin` exists
4. Script will add to PATH automatically

### Issue: Audio sounds too fast
**Solution**: The -20% rate is set in code. To adjust:
```python
communicate = edge_tts.Communicate(text=text, voice=voice, rate="-30%")  # Slower
```

### Issue: Pauses too short/long
**Solution**: Adjust pause durations in code:
```python
# After English
segments.append(AudioSegment.silent(duration=1500))  # Longer pause

# After Spanish
segments.append(AudioSegment.silent(duration=800))  # Longer pause
```

### Issue: File too large
**Solution**: Reduce bitrate:
```python
final_audio.export(output_file, format='mp3', bitrate='96k')  # Lower bitrate
```

## Maintenance

### Adding New Resources
1. Create cleaned script in `scripts/cleaned-audio-scripts/`
2. Add resource ID to script mapping in `generate-dual-voice-pydub.py`
3. Add voice configuration if using non-default voices
4. Run generation script

### Updating Voices
Edit the `VOICES` dictionary:
```python
VOICES = {
    'spanish': {
        38: 'es-MX-JorgeNeural',  # New male Mexican voice
    },
    'english': {
        38: 'en-GB-RyanNeural',  # British English
    }
}
```

### Regenerating Specific Resources
Modify the script temporarily:
```python
# In main() function
resource_ids = [2, 7, 10]  # Only these resources
```

## Performance

### Generation Times (Approximate)
- Single resource (5 phrases): ~30 seconds
- Single resource (30 phrases): ~3 minutes
- All 37 resources: ~45-60 minutes

### Rate Limiting
- 0.5 second pause between segments
- 2 second pause between resources
- No API limits (Edge TTS is free)

## Quality Assurance

### Verification Checklist
1. Listen to test file (`--test` mode)
2. Verify native pronunciation for both languages
3. Check pause lengths are natural
4. Confirm no production markers are spoken
5. Validate file sizes are reasonable
6. Test playback in web player

### Expected Results
- Clear, natural pronunciation
- Smooth transitions between languages
- No robotic artifacts
- Professional audio quality
- Appropriate learning pace

## Related Scripts

See `scripts/archive/experimental-audio/` for:
- SSML-based approaches
- Google TTS (gTTS) implementations
- Script cleaning variations
- Extraction utilities

## Deployment

After generation:
1. Audio files are in `public/audio/`
2. Build process copies to `build/audio/`
3. Next.js serves from `/audio/resource-{id}.mp3`
4. Resources reference as `audioUrl: '/audio/resource-{id}.mp3'`

## Support

For issues or questions:
1. Check this guide first
2. Review error messages carefully
3. Test with `--test` mode
4. Verify dependencies are installed
5. Check FFmpeg is in PATH

---

**Last Updated**: 2025-11-02
**Version**: 1.0 (Production)
**Status**: ✅ Complete - All 37 resources generated
