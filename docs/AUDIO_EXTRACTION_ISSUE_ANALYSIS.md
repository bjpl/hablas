# Audio Content Extraction Issue - Root Cause Analysis

**Date**: 2025-10-29
**Resource Affected**: resource-2.mp3 (Pronunciación: Entregas - Var 1)
**Status**: ❌ INCORRECT AUDIO GENERATED

---

## Executive Summary

The audio file `C:\Users\brand\Development\Project_Workspace\active-development\hablas\public\audio\resource-2.mp3` contains incorrectly extracted text. Instead of speaking the actual teaching content (English phrases + Spanish translations), it reads markdown metadata, speaker directions, and formatting markers.

---

## Problem Identification

### 1. Current Audio Content (WRONG)

The audio file currently speaks lines like:
- `"[Tone: Warm, encouraging, energetic]"`
- `"[Speaker: Spanish narrator - friendly male/female voice]"`
- `"Pause: 2 seconds"`
- `"Sound effect: Soft transition chime"`
- Random non-quoted metadata text

### 2. What It SHOULD Contain

Based on the script file `C:\Users\brand\Development\Project_Workspace\active-development\hablas\generated-resources\50-batch\repartidor\basic_audio_1-audio-script.txt`, the audio should be a **structured 7:15 minute lesson** with:

**Structure:**
1. **Introduction (00:00-00:50)**: Spanish narrator welcomes learners
2. **Main Content (00:50-05:45)**: 8 delivery phrases taught as:
   - Spanish context/explanation
   - English phrase spoken TWICE slowly with 3-second pause
   - Spanish translation
   - Practical tip in Spanish
3. **Quick Practice (06:20-07:00)**: All 8 English phrases at normal speed
4. **Conclusion (07:00-07:15)**: Motivational Spanish closing

**Example Teaching Segment:**
```
Spanish: "Frase número uno: Cuando llegas a la dirección del cliente."
English: "Hi, I have your delivery" [3-second pause]
English: "Hi, I have your delivery" [repeat]
Spanish: "En español: Hola, tengo su entrega. Esta es LA frase más importante..."
```

---

## Root Cause Analysis

### Faulty Code: `C:\Users\brand\Development\Project_Workspace\active-development\hablas\scripts\generate-audio-gtts.py`

**Lines 46-49:**
```python
def read_audio_script(resource_id):
    # Extract text to speak (remove markdown headers and metadata)
    lines = [line.strip() for line in content.split('\n')
            if line.strip() and not line.startswith('#') and not line.startswith('**')]
    return '\n'.join(lines[:50])  # Limit to first 50 lines
```

**Why This Is Wrong:**

1. **Overly Simple Filter**: Only removes lines starting with `#` and `**`
   - Misses lines like `"[Tone: ...]"`, `"[Speaker: ...]"`, `"[PAUSE: ...]"`
   - Includes stage directions and metadata

2. **No Quote Detection**: Doesn't extract text within quotes
   - The actual spoken content is ONLY in quoted strings
   - Everything else is production notes

3. **No Structure Preservation**: Loses the teaching flow
   - Should maintain Spanish intro → English phrase → Spanish translation pattern
   - Currently mixes everything randomly

4. **Arbitrary Line Limit**: `[:50]` is meaningless
   - Should extract based on semantic sections
   - 50 lines could cut mid-phrase

---

## Comparison: Wrong vs. Right

### ❌ WRONG (Current Extraction)

**Input** (script lines 10-25):
```
**[Tone: Warm, encouraging, energetic]**
**[Speaker: Spanish narrator - friendly male/female voice]**

"¡Hola, repartidor! Bienvenido a Hablas..."

**[Pause: 2 seconds]**
**[Sound effect: Soft transition chime]**
```

**Extracted** (what's being spoken):
```
[Tone: Warm, encouraging, energetic]
[Speaker: Spanish narrator - friendly male/female voice]
¡Hola, repartidor! Bienvenido a Hablas...
[Pause: 2 seconds]
[Sound effect: Soft transition chime]
```

### ✅ CORRECT (Should Extract)

**Input** (same script):
```
**[Tone: Warm, encouraging, energetic]**
**[Speaker: Spanish narrator - friendly male/female voice]**

"¡Hola, repartidor! Bienvenido a Hablas..."

**[Pause: 2 seconds]**
**[Sound effect: Soft transition chime]**
```

**Extracted** (what should be spoken):
```
¡Hola, repartidor! Bienvenido a Hablas...
```

---

## Corrected Extraction Logic

### New Implementation: `C:\Users\brand\Development\Project_Workspace\active-development\hablas\scripts\extract-audio-content-correct.py`

**Key Features:**

1. **Quote-Based Extraction**:
   ```python
   quote_pattern = r'"([^"]+)"'
   quotes = re.findall(quote_pattern, line)
   ```
   - Extracts ONLY text within double quotes
   - Skips all metadata and directions

2. **Language Detection**:
   ```python
   if 'spanish' in speaker.lower():
       current_language = 'spanish'
   elif 'english' in speaker.lower():
       current_language = 'english'
   ```
   - Tracks which language is being spoken
   - Maintains bilingual structure

3. **Pause & Repetition Handling**:
   ```python
   if 'PAUSE' in line.upper():
       pause_after = int(re.search(r'(\d+)\s*seconds?', line).group(1))
   if 'repeat' in next_line.lower():
       repetitions = 2
   ```
   - Preserves pauses between phrases (3 seconds for learning)
   - Detects repeated phrases (for practice)

4. **Segment Structuring**:
   ```python
   segments.append({
       'timestamp': current_timestamp,
       'language': current_language,
       'text': clean_text,
       'repetitions': repetitions,
       'pause_after': pause_after
   })
   ```
   - Organizes content by teaching segment
   - Maintains timing information

---

## Testing Results

### Test Command:
```bash
python scripts/extract-audio-content-correct.py \
  "generated-resources/50-batch/repartidor/basic_audio_1-audio-script.txt"
```

### Output (First 5 Segments):
```
📊 Extracted 34 spoken segments

1. [spanish] Frase número uno: Cuando llegas a la dirección del cliente.
   Repetitions: 1, Pause: 2s

2. [english] Hi, I have your delivery
   Repetitions: 1, Pause: 2s

3. [english] Hi, I have your delivery
   Repetitions: 1, Pause: 2s

4. [spanish] Frase dos: Para confirmar que es la persona correcta.
   Repetitions: 1, Pause: 2s

5. [english] Are you Michael?
   Repetitions: 1, Pause: 2s
```

### TTS-Ready Text:
**Spanish Output:**
```
Frase número uno: Cuando llegas a la dirección del cliente....
Frase dos: Para confirmar que es la persona correcta....
Frase tres: Al entregar el pedido al cliente....
```

**English Output:**
```
Hi, I have your delivery...
Hi, I have your delivery...
Are you Michael?...
Are you Michael?...
```

---

## Expected Audio Content Structure

### Full 7:15 Minute Lesson Breakdown

**SECTION 1: Introduction (00:00-00:50)**
- Language: Spanish
- Content: Welcome message and lesson overview
- Text: "¡Hola, repartidor! Bienvenido a Hablas..."

**SECTION 2: Phrase 1 - Arrival (00:50-01:35)**
- Spanish: "Frase número uno: Cuando llegas a la dirección del cliente."
- English (slow, 2x): "Hi, I have your delivery"
- Spanish: "En español: Hola, tengo su entrega..."

**SECTION 3: Phrase 2 - Name Confirmation (01:35-02:20)**
- Spanish: "Frase dos: Para confirmar que es la persona correcta."
- English (slow, 2x): "Are you Michael?"
- Spanish: "¿Usted es Michael? Cambia 'Michael' por el nombre..."

**SECTION 4: Phrase 3 - Handing Order (02:20-03:05)**
- Spanish: "Frase tres: Al entregar el pedido al cliente."
- English (slow, 2x): "Here's your order from Chipotle"
- Spanish: "Aquí está su pedido de Chipotle..."

**SECTION 5: Phrase 4 - Confirmation Code (03:05-03:50)**
- Spanish: "Frase cuatro: Cuando necesitas confirmación del cliente."
- English (slow, 2x): "Can you confirm the code, please?"
- Spanish: "¿Puede confirmar el código, por favor?..."

**SECTION 6: Phrase 5 - Farewell (03:50-04:30)**
- Spanish: "Frase cinco: Para despedirte profesionalmente."
- English (slow, 2x): "Have a great day!"
- Spanish: "¡Que tenga un excelente día!..."

**SECTION 7: Phrase 6 - Access Issues (04:30-05:10)**
- Spanish: "Frase seis: Cuando no puedes acceder al edificio."
- English (slow, 2x): "I'm outside, can you come out?"
- Spanish: "Estoy afuera, ¿puede salir?..."

**SECTION 8: Phrase 7 - Contactless Delivery (05:10-05:50)**
- Spanish: "Frase siete: Para entregas sin contacto."
- English (slow, 2x): "I left it at the door"
- Spanish: "Lo dejé en la puerta..."

**SECTION 9: Phrase 8 - Thank You (05:50-06:20)**
- Spanish: "Frase ocho: Cuando el cliente te da propina."
- English (slow, 2x): "Thank you so much!"
- Spanish: "¡Muchas gracias!..."

**SECTION 10: Quick Practice (06:20-07:00)**
- All 8 English phrases at normal speed with 1.5s pauses

**SECTION 11: Conclusion (07:00-07:15)**
- Spanish motivational closing

---

## Recommended Actions

### 1. Immediate Fix

**Replace** `C:\Users\brand\Development\Project_Workspace\active-development\hablas\scripts\generate-audio-gtts.py` function:

```python
def read_audio_script(resource_id):
    """CORRECTED: Extract only quoted spoken text"""
    script_path = file_mapping.get(resource_id)
    if not script_path or not os.path.exists(script_path):
        return None

    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Use new extraction function
    from extract_audio_content_correct import extract_spoken_text_from_audio_script, format_for_tts

    segments = extract_spoken_text_from_audio_script(content)
    tts_text = format_for_tts(segments, separate_languages=False)

    return tts_text['combined']
```

### 2. Regenerate All Audio

```bash
# Re-run with corrected extraction
python scripts/generate-audio-gtts.py
```

### 3. Validate Output

**Check that resource-2.mp3 now contains:**
- ✅ Clear Spanish/English teaching structure
- ✅ No metadata or stage directions
- ✅ Natural pauses between phrases
- ✅ Repeated English phrases for practice
- ✅ ~7 minutes duration

---

## Lessons Learned

### Design Principles for Text Extraction

1. **Semantic Understanding**: Extract based on MEANING not just patterns
   - Quoted text = spoken content
   - Brackets = production metadata (skip)

2. **Structure Preservation**: Maintain the teaching flow
   - Spanish context → English phrase → Spanish translation
   - Don't just concatenate all text

3. **Language Awareness**: Track which language is being spoken
   - Bilingual content requires careful segmentation
   - Mix languages intentionally, not accidentally

4. **Test with Real Data**: Use actual script files for testing
   - Mock data can hide edge cases
   - Production scripts have complexity you won't anticipate

---

## Related Files

**Source Script:**
- `C:\Users\brand\Development\Project_Workspace\active-development\hablas\generated-resources\50-batch\repartidor\basic_audio_1-audio-script.txt`

**Audio Files:**
- `C:\Users\brand\Development\Project_Workspace\active-development\hablas\public\audio\resource-2.mp3` (INCORRECT)

**Generation Scripts:**
- `C:\Users\brand\Development\Project_Workspace\active-development\hablas\scripts\generate-audio-gtts.py` (OLD - BROKEN)
- `C:\Users\brand\Development\Project_Workspace\active-development\hablas\scripts\extract-audio-content-correct.py` (NEW - FIXED)

**Lesson Content:**
- `C:\Users\brand\Development\Project_Workspace\active-development\hablas\generated-resources\50-batch\repartidor\basic_phrases_1.md`

---

## Appendix: Full Text Comparison

### Current Audio (WRONG)
First 200 characters being spoken:
```
AUDIO SCRIPT: Pronunciación: Entregas - Var 1
Total Duration**: 7:15 minutes
Target**: Delivery drivers (Beginner level)
Language**: Bilingual (Spanish/English)
INTRODUCCIÓN
[Tone: Warm, encouraging, energetic]
```

### Corrected Audio (RIGHT)
First 200 characters that should be spoken:
```
¡Hola, repartidor! Bienvenido a Hablas. Soy tu instructor de inglés para domiciliarios. En los próximos siete minutos, vas a aprender ocho frases esenciales en inglés para tus entregas diarias...
```

---

**Author**: Research Agent
**Date**: 2025-10-29
**Version**: 1.0
