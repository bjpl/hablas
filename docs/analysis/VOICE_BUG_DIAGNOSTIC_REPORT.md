# Voice Assignment Bug - Diagnostic Report

## Executive Summary

**CRITICAL BUG FOUND**: The language detection algorithm in `scripts/generate-resource-1-complete.py` has a fatal flaw that causes English phrases to be incorrectly identified as Spanish and spoken with the Spanish voice.

---

## Root Cause Analysis

### The Problematic Function: `is_spanish()`

Located at lines 29-45 in `scripts/generate-resource-1-complete.py`:

```python
def is_spanish(text: str) -> bool:
    """Simple Spanish detection - if has Spanish characters or common words"""
    spanish_chars = 'áéíóúñ¿¡'
    spanish_words = ['hola', 'tengo', 'su', 'entrega', 'español', 'gracias', 'día',
                     'buenos', 'soy', 'tu', 'para', 'con', 'una', 'el', 'la', 'de']

    text_lower = text.lower()

    # Check for Spanish characters
    if any(char in text for char in spanish_chars):
        return True

    # Check for Spanish words
    if any(word in text_lower for word in spanish_words):
        return True

    return False
```

### The Fatal Flaw

**Problem**: The function uses substring matching on common Spanish words that are also common substrings in English words.

**False Positives Identified**:

1. **"de" matches in English words**:
   - "Can you come outsi**de**?" → Detected as Spanish ❌
   - "I have your or**de**r from McDonald's." → Detected as Spanish ❌
   - Any word containing "de": outside, order, older, etc.

2. **"el" matches in English words**:
   - "Di **el** nombre de la app claramente." (This is actually Spanish, OK)
   - Any word with "el": help, welcome, hotel, etc.

3. **"la" matches in English words**:
   - "Di el nombre de **la** app claramente." (Spanish, OK)
   - Potential issues: late, place, plan, etc.

4. **"su" matches in English words**:
   - "I need utensils or napkins?" → Contains "su" in "utensils" ❌
   - Any word with "su": sure, sugar, issue, etc.

5. **"con" matches in English words**:
   - "Hi! I'm Carlos, your driver today." → Contains "con" in "Carlos" (rare)
   - More common: continue, contact, confused, etc.

---

## Confirmed Bug Examples

### Test Results:

| Line Text | Expected Voice | Actual Detection | Bug? |
|-----------|---------------|------------------|------|
| `Are you Sarah?` | English | ENGLISH ✅ | No |
| `Hi! I'm Carlos, your driver today.` | English | ENGLISH ✅ | No |
| `Is this 425 Main Street?` | English | ENGLISH ✅ | No |
| `I have your order from McDonald's.` | English | **SPANISH** ❌ | **YES** (matches "de") |
| `Can you come outside?` | English | **SPANISH** ❌ | **YES** (matches "de") |
| `¿Eres Sarah?` | Spanish | SPANISH ✅ | No |
| `Tengo tu pedido de McDonald's.` | Spanish | SPANISH ✅ | No |

### Additional High-Risk English Phrases

From the script that are vulnerable to false detection:

- Line 46: "Where would you like me to leave it?"
  - Risk: "la" in "leave" - but doesn't match (needs full word)

- Line 65: "Can you come outside?"
  - **CONFIRMED BUG**: "de" substring in "outside"

- Line 112: "Here you go! Have a great day!"
  - Risk: "la" in words

- Line 196: "I'm your Uber Eats driver."
  - Risk: if substring matching fails

---

## Impact Assessment

### Severity: **CRITICAL**

**Affected Phrases** (estimated):
- At minimum: 2 confirmed bugs found in testing
- Potentially: 10-15+ phrases containing common English words with "de", "la", "el", "con", "su" substrings

**User Experience Impact**:
- **Severe confusion** when English phrases are spoken in Spanish voice
- **Language learning disruption** - users cannot distinguish English from Spanish
- **Unprofessional** - breaks the educational flow
- **Trust damage** - users may think the app is broken

**Business Impact**:
- Users will not trust the app for language learning
- Negative reviews likely
- Abandonment before completing lesson 1

---

## The Fix

### Recommended Solution: Word Boundary Matching

Replace substring matching with **whole-word matching**:

```python
def is_spanish(text: str) -> bool:
    """Detect Spanish using character markers and whole-word matching"""
    import re

    # Spanish-specific characters are a strong signal
    spanish_chars = 'áéíóúñ¿¡'
    if any(char in text for char in spanish_chars):
        return True

    # Use word boundaries to match complete words only
    spanish_words = [
        'hola', 'tengo', 'entrega', 'español', 'gracias',
        'buenos', 'soy', 'para', 'con', 'una',
        'día', 'días', 'tu', 'tus', 'mi', 'mis',
        'que', 'qué', 'cuál', 'cuáles', 'cómo',
        'dónde', 'cuándo', 'por', 'favor',
        'disculpa', 'perdón', 'excelente',
        'necesitas', 'necesito', 'puedes', 'puedo',
        'tienes', 'tengo', 'eres', 'soy',
        'está', 'estoy', 'estás', 'están',
        'problema', 'problemas', 'ayuda',
        'casa', 'carro', 'pedido', 'orden',
        'restaurante', 'comida', 'bebida'
    ]

    text_lower = text.lower()

    # Check for complete word matches only
    for word in spanish_words:
        # Use word boundary regex: \b matches word boundaries
        pattern = r'\b' + re.escape(word) + r'\b'
        if re.search(pattern, text_lower):
            return True

    return False
```

### Alternative: Simpler Heuristic Approach

If avoiding regex:

```python
def is_spanish(text: str) -> bool:
    """Detect Spanish using character markers and smarter word matching"""

    # Spanish characters are definitive
    spanish_chars = 'áéíóúñ¿¡'
    if any(char in text for char in spanish_chars):
        return True

    # For lines without special chars, look for distinctive Spanish words only
    # Avoid short common substrings like "de", "el", "la", "con", "su"
    distinctive_spanish = [
        'hola', 'tengo', 'entrega', 'español', 'gracias',
        'buenos', 'soy', 'para', 'una', 'día', 'días',
        'tu ', ' tu', 'problema', 'ayuda', 'casa', 'carro',
        'pedido', 'orden', 'restaurante', 'comida',
        'necesitas', 'puedes', 'tienes', 'eres',
        'está', 'estoy', 'favor', 'disculpa'
    ]

    text_lower = ' ' + text.lower() + ' '  # Add spaces for boundary checking

    return any(word in text_lower for word in distinctive_spanish)
```

### Testing the Fix

```python
# Test cases to validate fix
test_cases = [
    ("I have your order from McDonald's.", False),  # Must be English
    ("Can you come outside?", False),               # Must be English
    ("Tengo tu pedido de McDonald's.", True),       # Must be Spanish
    ("¿Puedes salir afuera?", True),                # Must be Spanish
    ("Are you Sarah?", False),                      # Must be English
    ("Buenos días! Tengo una entrega.", True),      # Must be Spanish
]

for text, expected_spanish in test_cases:
    result = is_spanish(text)
    status = "✅" if result == expected_spanish else "❌"
    print(f"{status} '{text}' → {'Spanish' if result else 'English'}")
```

---

## Implementation Steps

1. **Back up current script**:
   ```bash
   cp scripts/generate-resource-1-complete.py scripts/generate-resource-1-complete.py.backup
   ```

2. **Replace `is_spanish()` function** with word-boundary version

3. **Test with known bug cases**:
   - "Can you come outside?" must return False
   - "I have your order from McDonald's." must return False

4. **Regenerate audio**:
   ```bash
   python3 scripts/generate-resource-1-complete.py
   ```

5. **Manual verification**:
   - Listen to phrases around lines 46, 65, 112, 196
   - Confirm English voice is used

6. **Full regression test**:
   - Verify all Spanish phrases still use Spanish voice
   - Verify all English phrases use English voice

---

## Prevention for Future Resources

### Code Review Checklist:
- ✅ Use word boundary matching for language detection
- ✅ Avoid short substring matches (2-3 character words)
- ✅ Test with real script samples before full generation
- ✅ Implement automated tests for language detection
- ✅ Use distinctive vocabulary for detection

### Unit Tests Template:

```python
def test_language_detection():
    """Test cases covering known edge cases"""

    # English phrases that should NOT be Spanish
    english_tests = [
        "Can you come outside?",
        "I have your order from McDonald's.",
        "Where would you like me to leave it?",
        "Do you have your ID?",
        "I'll wait here for security.",
    ]

    # Spanish phrases that should be Spanish
    spanish_tests = [
        "¿Puedes salir afuera?",
        "Tengo tu pedido de McDonald's.",
        "¿Dónde quieres que lo deje?",
        "Buenos días! Tengo una entrega.",
        "Usa tu nombre para generar confianza.",
    ]

    for phrase in english_tests:
        assert not is_spanish(phrase), f"False positive: {phrase}"

    for phrase in spanish_tests:
        assert is_spanish(phrase), f"False negative: {phrase}"
```

---

## Conclusion

**BUG CONFIRMED**: The `is_spanish()` function uses substring matching which causes common English words containing "de", "la", "el", "con", "su" to be incorrectly classified as Spanish.

**RECOMMENDED ACTION**: Implement word-boundary matching immediately before regenerating any audio files.

**PRIORITY**: CRITICAL - Affects core user experience and educational value.

---

*Report generated: 2025-11-09*
*Agent: AudioDiagnosticsAgent*
*Bug severity: Critical*
*Estimated fix time: 15 minutes*
