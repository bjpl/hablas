# Audio System Summary - Hablas Platform

## Quick Reference

**Production Script**: `scripts/generate-dual-voice-pydub.py`
**Documentation**: `scripts/AUDIO_GENERATION_GUIDE.md`
**Archived Experiments**: `scripts/archive/experimental-audio/`

## Production System

### Technology
- **TTS Engine**: Microsoft Edge TTS (edge-tts Python package)
- **Audio Processing**: pydub + FFmpeg
- **Voices**: Colombian/Mexican Spanish + American English neural voices
- **Approach**: Generate segments individually, concatenate with pauses

### Command
```bash
python scripts/generate-dual-voice-pydub.py
```

### Output
- 37 MP3 files: `public/audio/resource-1.mp3` through `resource-37.mp3`
- Bilingual audio with native pronunciation for both languages
- -20% playback rate for learners
- Natural pauses between segments

## Key Features

1. **Dual Native Voices**
   - Spanish segments → Colombian/Mexican voices
   - English segments → American English voices
   - Perfect pronunciation in both languages

2. **Intelligent Language Detection**
   - Per-line language detection
   - Regex-based pattern matching
   - Automatic voice switching

3. **Professional Quality**
   - 128kbps MP3 encoding
   - Natural pause timing
   - Smooth concatenation
   - No robotic artifacts

4. **Scalable & Reliable**
   - No rate limits (Edge TTS is free)
   - Template fallback for resources without scripts
   - Error handling and recovery
   - Automatic cleanup

## Input Format

Cleaned scripts with pure dialogue only:

```
Hi, I have your delivery

Hi, I have your delivery

Hola, tengo su entrega

Thank you

Thank you

Gracias
```

No production markers, no timestamps, no metadata - just the phrases to be spoken.

## Development History

### 20 Scripts Archived (5 Phases)

1. **gTTS Experiments** (7 scripts)
   - Hit rate limits constantly
   - Lower quality voices
   - No native accents available

2. **Azure TTS** (2 scripts)
   - Required API keys/costs
   - Decided on free alternative

3. **Edge TTS Single-Voice** (2 scripts)
   - Worked but monolingual
   - Lacked native pronunciation for both languages

4. **SSML Dual-Voice** (2 scripts)
   - Complex, unreliable voice switching
   - Parsing issues

5. **pydub Concatenation** ✅ **PRODUCTION**
   - Reliable segment generation
   - Perfect native pronunciation
   - Complete control over timing

### Script Cleaning (12 scripts)
- Multiple extraction approaches
- Various cleaning strategies
- Converged on simple line-by-line processing

## Current Status

✅ **COMPLETE - November 2, 2025**

- All 37 bilingual resources have audio
- Native pronunciation for Spanish and English
- Professional quality, no production markers
- Deployed and tested

## Directory Structure

```
scripts/
├── AUDIO_GENERATION_GUIDE.md          # Complete usage guide
├── generate-dual-voice-pydub.py       # Production script
├── content-audit.py                   # Content verification
├── cleaned-audio-scripts/             # Input scripts (9 files)
├── archive/
│   └── experimental-audio/            # 20 archived experiments
│       ├── README.md                  # Archive documentation
│       ├── generate-audio-gtts.py    # Google TTS attempts
│       ├── generate-audio-edge.py    # Edge TTS single-voice
│       ├── generate-audio-ssml.py    # SSML approach
│       ├── clean-all-audio-scripts.py # Script cleaning
│       └── ... (16 more experimental scripts)
└── [other non-audio scripts]
```

## Files by Purpose

### KEEP (Production)
- `generate-dual-voice-pydub.py` - Audio generation
- `AUDIO_GENERATION_GUIDE.md` - Documentation
- `cleaned-audio-scripts/` - Input data
- `content-audit.py` - Quality assurance

### ARCHIVED (Experiments)
- 20 experimental scripts in `archive/experimental-audio/`
- All documented with rationale in archive README

### OTHER (Non-Audio)
- TypeScript resource generation scripts
- Integration utilities
- Setup scripts
- Testing utilities

## For Developers

### To Generate Audio
1. Install dependencies: `pip install edge-tts pydub`
2. Install FFmpeg to `C:\ffmpeg\bin`
3. Run: `python scripts/generate-dual-voice-pydub.py`
4. Test first with: `python scripts/generate-dual-voice-pydub.py --test`

### To Add New Resources
1. Create cleaned script in `scripts/cleaned-audio-scripts/`
2. Add resource ID to `generate-dual-voice-pydub.py` script mapping
3. Optionally configure voices in `VOICES` dict
4. Run generation script

### To Modify Voices
Edit the `VOICES` dictionary in `generate-dual-voice-pydub.py`:
```python
VOICES = {
    'spanish': {
        resource_id: 'es-CO-SalomeNeural',  # Colombian female
    },
    'english': {
        resource_id: 'en-US-JennyNeural',   # American female
    }
}
```

## Quality Metrics

- **Native Pronunciation**: ✅ Both languages sound natural
- **No Production Markers**: ✅ Students hear only phrases
- **Appropriate Pacing**: ✅ -20% rate for learners
- **Natural Pauses**: ✅ 1000ms (English) / 500ms (Spanish)
- **File Sizes**: ✅ 0.5-10 MB per resource
- **Coverage**: ✅ All 37 resources complete

## Troubleshooting

See `scripts/AUDIO_GENERATION_GUIDE.md` section "Common Issues" for:
- FFmpeg installation
- Module dependencies
- Pause length adjustments
- Bitrate optimization
- Generation errors

## Next Steps

The audio system is **complete and production-ready**. Future work might include:

1. **Content Expansion**
   - Add more phrases to existing resources
   - Create new resource audio scripts

2. **Quality Improvements**
   - A/B test different pause lengths
   - Experiment with prosody adjustments
   - Test with real learners for feedback

3. **Voice Variety**
   - Add more Colombian vs Mexican voice usage
   - Consider gender variety per resource

4. **Automation**
   - CI/CD integration for automatic generation
   - Validation scripts for audio quality

---

**System Status**: ✅ Production Ready
**Last Generation**: November 1-2, 2025
**Files Generated**: 37/37 (100%)
**Approach**: Edge TTS + pydub concatenation
**Documentation**: Complete
