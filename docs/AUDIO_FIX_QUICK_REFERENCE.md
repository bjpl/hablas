# Audio Extraction Fix - Quick Reference

## Problem
Audio file resource-2.mp3 reads markdown metadata instead of actual teaching content.

## Root Cause
`generate-audio-gtts.py` extracts ALL non-header lines instead of ONLY quoted spoken text.

## Solution
Replace extraction function with quote-based parsing.

---

## Corrected Extraction Function

```python
import re

def read_audio_script_CORRECTED(resource_id):
    """
    CORRECTED: Extract only spoken text from audio script files.
    Skips markdown headers, metadata, speaker directions, and formatting.
    """

    script_path = file_mapping.get(resource_id)
    if not script_path or not os.path.exists(script_path):
        return None

    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()

    spoken_segments = []
    lines = content.split('\n')

    for i, line in enumerate(lines):
        # Skip empty lines
        if not line.strip():
            continue

        # Skip markdown headers and horizontal rules
        if line.strip().startswith('#') or line.strip().startswith('---'):
            continue

        # Skip metadata lines (Tone, Speaker, Pause, Sound)
        if any(marker in line for marker in ['[Tone:', '[Speaker:', '[Pause:', '[Sound', '[PAUSE']):
            continue

        # Extract text within double quotes (actual spoken content)
        quote_pattern = r'"([^"]+)"'
        quotes = re.findall(quote_pattern, line)

        for quote in quotes:
            clean_text = quote.strip()

            # Skip very short quotes (likely not real content)
            if len(clean_text) < 5:
                continue

            spoken_segments.append(clean_text)

    # Join with natural pauses for TTS
    return '... '.join(spoken_segments)
```

---

## Before vs. After

### Before (WRONG)
```python
lines = [line.strip() for line in content.split('\n')
         if line.strip() and not line.startswith('#') and not line.startswith('**')]
return '\n'.join(lines[:50])
```

**Speaks:**
```
[Tone: Warm, encouraging]
[Speaker: Spanish narrator]
Pause: 2 seconds
```

### After (CORRECT)
```python
quote_pattern = r'"([^"]+)"'
quotes = re.findall(quote_pattern, line)
spoken_segments.append(clean_text)
return '... '.join(spoken_segments)
```

**Speaks:**
```
¡Hola, repartidor! Bienvenido a Hablas...
Hi, I have your delivery...
Hi, I have your delivery...
```

---

## Quick Fix Implementation

### Option 1: Update generate-audio-gtts.py

1. Open `scripts/generate-audio-gtts.py`
2. Find function `read_audio_script` (line 25)
3. Replace with corrected version above
4. Add `import re` at top if missing
5. Run: `python scripts/generate-audio-gtts.py`

### Option 2: Use New Extraction Module

1. Use `scripts/extract-audio-content-correct.py`
2. Import in generate-audio-gtts.py:
   ```python
   from extract_audio_content_correct import extract_spoken_text_from_audio_script, format_for_tts
   ```
3. Replace read_audio_script function:
   ```python
   def read_audio_script(resource_id):
       script_path = file_mapping.get(resource_id)
       if not script_path or not os.path.exists(script_path):
           return None

       with open(script_path, 'r', encoding='utf-8') as f:
           content = f.read()

       segments = extract_spoken_text_from_audio_script(content)
       tts_text = format_for_tts(segments, separate_languages=False)
       return tts_text['combined']
   ```

---

## Validation Checklist

After regenerating audio, verify:

- [ ] No metadata in audio (`[Tone:`, `[Speaker:`, etc.)
- [ ] Clear Spanish/English structure
- [ ] English phrases repeated twice
- [ ] Natural pauses between phrases
- [ ] ~7 minute duration (not 30 seconds)
- [ ] Starts with Spanish welcome
- [ ] Contains 8 delivery phrases
- [ ] Ends with Spanish conclusion

---

## Expected Content (resource-2.mp3)

**Should contain 34 spoken segments:**

1. Spanish intro: "¡Hola, repartidor! Bienvenido a Hablas..."
2. Spanish context: "Frase número uno: Cuando llegas..."
3. English phrase: "Hi, I have your delivery"
4. English repeat: "Hi, I have your delivery"
5. Spanish translation: "En español: Hola, tengo su entrega..."
6. [Repeat pattern for 7 more phrases]
7. Spanish practice intro: "¡Excelente! Ahora viene la práctica rápida..."
8. All 8 English phrases at normal speed
9. Spanish conclusion: "Felicidades, repartidor..."

**Total Duration**: ~7:15 minutes
**File Size**: ~7-10 MB
**Segments**: 34 spoken parts

---

## Testing Command

```bash
# Test extraction on actual script
python scripts/extract-audio-content-correct.py \
  "generated-resources/50-batch/repartidor/basic_audio_1-audio-script.txt"

# Should output:
# 📊 Extracted 34 spoken segments
# 1. [spanish] Frase número uno: Cuando llegas...
# 2. [english] Hi, I have your delivery
# ...
```

---

## Key Principles

1. **Only extract quoted text** - Everything in quotes is meant to be spoken
2. **Skip metadata markers** - `[Tone:]`, `[Speaker:]`, `[Pause:]` are production notes
3. **Preserve language structure** - Maintain Spanish → English → Spanish flow
4. **Include repetitions** - English phrases should be heard twice for learning

---

**Quick Reference Created**: 2025-10-29
**Status**: Ready to implement
**Estimated Fix Time**: 5 minutes + audio regeneration (~10 minutes)
