# Experimental Audio Generation Scripts

This directory contains experimental and deprecated audio generation approaches that were explored during development but are not part of the production system.

## Production System

**Current production script**: `../../generate-dual-voice-pydub.py`

See `../../AUDIO_GENERATION_GUIDE.md` for production documentation.

## Archived Scripts

### Script Cleaning Experiments

#### `clean-all-audio-scripts.py`
**Purpose**: Remove production markers from audio scripts
**Approach**: Regex-based cleaning of headers, timestamps, and metadata
**Status**: Superseded by final cleaning approach
**Why Archived**: Multiple iterations led to cleaner solution

#### `export-cleaned-audio-scripts.py`
**Purpose**: Export cleaned versions of audio scripts
**Approach**: Remove `**[Speaker:]`, `**[Tone:]`, timestamps
**Status**: Partial implementation
**Why Archived**: Didn't handle all production markers

#### `extract-pure-dialogue.py`
**Purpose**: Extract ONLY dialogue from scripts
**Approach**: Keep quoted text, remove all narrator content
**Status**: Good concept, incomplete execution
**Why Archived**: Final approach integrates better with dual-voice system

### Dialogue Extraction Experiments

#### `extract-audio-content-correct.py`
**Purpose**: Extract spoken text from audio-script.txt files
**Approach**: Parse segments with timestamps, repetitions, pauses
**Status**: Sophisticated parser, overly complex
**Why Archived**: Production uses simpler line-by-line approach

#### `extract-dialogue-from-markdown.py`
**Purpose**: Extract English/Spanish pairs from markdown resources
**Approach**: Pattern matching for `**English**: / **Español**:` format
**Status**: Template-based, not complete
**Why Archived**: Most resources use audio-script.txt format instead

### Minimal Script Experiments

#### `create-minimal-audio-scripts.py`
**Purpose**: Create ultra-minimal phrase-only scripts
**Approach**: Hardcoded phrase dictionaries per resource
**Status**: Good idea, incomplete data
**Why Archived**: Only 2 resources defined, needs 37

#### `FINAL-create-phrases-only.py`
**Purpose**: Create absolute minimum phrase scripts
**Approach**: Essential phrases only, zero narrator
**Status**: Template-based solution
**Why Archived**: Same as above - incomplete resource coverage

### SSML and Voice Experiments

#### `convert-to-dual-voice-ssml.py`
**Purpose**: Convert cleaned scripts to SSML with voice tags
**Approach**: Wrap Spanish/English in `<voice>` tags for single-pass TTS
**Status**: Sophisticated language detection
**Why Archived**: SSML approach abandoned for pydub concatenation

#### `generate-audio-ssml.py`
**Purpose**: Generate audio from SSML files
**Approach**: Edge TTS with SSML input
**Status**: Incomplete implementation
**Why Archived**: SSML proved less reliable than segment concatenation

### Alternative TTS Engines

#### `generate-audio-gtts.py`
**Purpose**: Generate audio with Google TTS
**Approach**: gTTS library with rate limiting
**Status**: Working but limited
**Why Archived**:
- Hit rate limits frequently
- Lower quality voices
- No Colombian/Mexican accents
- Edge TTS is superior

#### `generate-audio-edge.py`
**Purpose**: Generate audio with Edge TTS (single voice)
**Approach**: One voice per resource
**Status**: Working but monolingual
**Why Archived**: Dual-voice approach is better for bilingual content

#### `generate-audio-cleaned.py`
**Purpose**: Generate from cleaned scripts with Edge TTS
**Approach**: Single voice, cleaned input
**Status**: Working
**Why Archived**: Superseded by dual-voice version

## Evolution Timeline

1. **Phase 1**: gTTS experiments (rate limits hit)
2. **Phase 2**: Edge TTS single-voice (working but monolingual)
3. **Phase 3**: SSML dual-voice approach (parsing issues)
4. **Phase 4**: pydub concatenation (PRODUCTION - works perfectly)

## Key Learnings

### What Worked
- Edge TTS: Free, unlimited, high-quality neural voices
- pydub: Reliable audio concatenation with precise timing
- Language detection: Simple regex patterns work well
- Segment-by-segment: More control than single-pass SSML

### What Didn't Work
- gTTS: Rate limits and quality issues
- SSML: Complex, less reliable voice switching
- Hardcoded phrases: Doesn't scale to 37 resources
- Over-engineered parsers: Simple line-by-line is better

### Best Practices Discovered
1. Clean scripts to pure dialogue before generation
2. Detect language per line, not per word
3. Use natural pauses (1000ms English, 500ms Spanish)
4. Generate segments individually, then concatenate
5. Add -20% rate reduction for learners
6. Use paired voices (same gender for both languages)

## If You Need to Reference These

### For Script Cleaning
- `extract-pure-dialogue.py` has good dialogue detection patterns
- `clean-all-audio-scripts.py` shows comprehensive marker removal

### For SSML Approach
- `convert-to-dual-voice-ssml.py` has excellent language detection
- `generate-audio-ssml.py` shows SSML structure

### For gTTS
- `generate-audio-gtts.py` shows rate limit handling
- Useful if Edge TTS becomes unavailable

## Migration to Production

To understand the production system:
1. Read `../../AUDIO_GENERATION_GUIDE.md`
2. Review `../../generate-dual-voice-pydub.py`
3. Check `../../cleaned-audio-scripts/` for input format

## Restoration

If you need to restore any experimental approach:
1. Copy script back to `scripts/` directory
2. Install required dependencies
3. Update file paths as needed
4. Test with `--test` mode first

## Notes

These scripts are preserved for:
- Historical reference
- Alternative approach documentation
- Learning from iteration process
- Potential future experimentation

They are NOT maintained and may have:
- Outdated dependencies
- Broken file paths
- Incomplete implementations
- Known bugs

Use production system for all audio generation.

---

**Archived**: 2025-11-02
**Total Scripts**: 13 experimental approaches
**Production System**: `generate-dual-voice-pydub.py` (dual-voice concatenation)
