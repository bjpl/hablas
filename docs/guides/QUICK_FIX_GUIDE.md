# Quick Fix Guide for Audio Issues

**Version**: 1.0
**Date**: 2025-11-10
**Purpose**: Step-by-step solutions for common audio generation problems

---

## Overview

This guide provides tested, working solutions for the most common audio generation issues discovered through auditing Resources 1, 4, and comprehensive analysis.

Each issue includes:
- **Symptom** - How to identify the problem
- **Root Cause** - Why it happens
- **Fix** - Exact code changes needed
- **Verification** - How to confirm it's fixed

---

## Issue 1: Missing Phrases (Incomplete Extraction)

### Symptom
Audio file contains only first 10-15 phrases, but source markdown has 20-30 phrases.

### How to Identify
```bash
# Count source phrases
grep -c '\*\*English\*\*:' generated-resources/50-batch/repartidor/basic_phrases_1.md
# Result: 30

# Count extracted phrases (divide by 6 lines per phrase)
wc -l scripts/final-phrases-only/resource-1-complete.txt
# Result: 90 lines = 15 phrases

# ISSUE: 30 source phrases but only 15 extracted!
```

### Root Cause
Arbitrary line limit in extraction function:

```python
# WRONG - limits to first 50 lines
def read_audio_script(resource_id):
    lines = [line.strip() for line in content.split('\n') if line.strip()]
    return '\n'.join(lines[:50])  # ❌ Truncates content!
```

### Fix

**Option A: Remove Line Limit**
```python
# CORRECT - extracts all content
def read_audio_script(resource_id):
    lines = [line.strip() for line in content.split('\n') if line.strip()]
    return '\n'.join(lines)  # ✅ No truncation
```

**Option B: Use Phrase-Based Extraction** (RECOMMENDED)
```python
def extract_all_phrases_from_markdown(md_file: str) -> List[Dict]:
    """Extract ALL bilingual phrases - no limits"""

    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()

    phrases = []

    # Pattern: **English**: "phrase" ... **Español**: translation
    pattern = r'\*\*English\*\*:\s*"([^"]+)".*?\*\*Español\*\*:\s*([^\n]+)'
    matches = re.findall(pattern, content, re.DOTALL)

    for english, spanish in matches:
        phrases.append({
            'english': english.strip(),
            'spanish': spanish.strip()
        })

    return phrases  # ✅ Returns ALL phrases, no limit
```

### Verification Steps
```bash
# 1. Re-run extraction
python scripts/extract-phrases.py --resource 1

# 2. Verify phrase count matches
source_count=$(grep -c '\*\*English\*\*:' generated-resources/50-batch/repartidor/basic_phrases_1.md)
extracted_count=$(($(wc -l < scripts/final-phrases-only/resource-1-complete.txt) / 6))
echo "Source: $source_count, Extracted: $extracted_count"

# 3. Should show: Source: 30, Extracted: 30 ✅
```

---

## Issue 2: Wrong Voice Detection (Spanish Phrases Using English Voice)

### Symptom
Spanish phrases like "Solo recojo y entrego" are narrated with English voice instead of Spanish voice.

### How to Identify
```bash
# Listen to audio at 2:30 where "Solo recojo y entrego" appears
ffplay -ss 00:02:30 -t 10 public/audio/resource-4.mp3

# Should hear: Spanish voice (Colombian/Mexican accent)
# Bug: Hear English voice instead
```

### Root Cause
Language detection missing delivery-specific Spanish vocabulary:

```python
# WRONG - doesn't include delivery vocabulary
spanish_words = ['hola', 'tengo', 'gracias']  # ❌ Missing 'solo', 'recojo', 'entrego'

def detect_language(text: str) -> str:
    for word in spanish_words:
        if word in text.lower():  # ❌ No word boundaries
            return 'spanish'
    return 'english'
```

### Fix

**Step 1: Add Delivery-Specific Spanish Words**
```python
def detect_language(text: str) -> str:
    """Detect language with delivery-specific vocabulary"""

    # 1. Spanish characters are definitive
    if re.search(r'[¿¡áéíóúüñ]', text):
        return 'spanish'

    # 2. Enhanced Spanish word list
    spanish_words = [
        # Common words
        'hola', 'tengo', 'su', 'entrega', 'gracias', 'día',
        'está', 'estoy', 'puede', 'quiere', 'necesito',
        # DELIVERY-SPECIFIC (the fix!)
        'solo', 'recojo', 'entrego', 'dejaré', 'puerta',
        'edificio', 'apartamento', 'afuera', 'esperaré',
        'intenté', 'llamarte', 'código', 'dirección'
    ]

    # 3. Word boundary matching (critical!)
    text_lower = text.lower()
    for word in spanish_words:
        pattern = r'\b' + re.escape(word) + r'\b'  # ✅ Word boundaries
        if re.search(pattern, text_lower):
            return 'spanish'

    return 'english'
```

### Verification Steps
```bash
# Test the detection function directly
python3 << 'EOF'
import re

# Test phrases
test_phrases = [
    "Solo recojo y entrego",  # Should be Spanish
    "I'm outside the building",  # Should be English
    "Dejaré aquí en la puerta",  # Should be Spanish
    "Can you come to the door?"  # Should be English
]

def detect_language(text: str) -> str:
    # (paste the fixed function here)
    pass

for phrase in test_phrases:
    lang = detect_language(phrase)
    print(f"{phrase}: {lang}")
EOF

# Expected output:
# Solo recojo y entrego: spanish ✅
# I'm outside the building: english ✅
# Dejaré aquí en la puerta: spanish ✅
# Can you come to the door?: english ✅
```

---

## Issue 3: English Words Using Spanish Voice (False Positives)

### Symptom
English phrases like "I'm outside", "Here's your order", "Thank you, customer" use Spanish voice.

### How to Identify
```bash
# Listen to these phrases - should be English voice
grep -n "outside\|order\|customer" scripts/final-phrases-only/resource-*.txt

# Check audio at those line numbers
# Bug: Hear Spanish voice on English phrases
```

### Root Cause
Substring matching without word boundaries:

```python
# WRONG - matches substrings
spanish_patterns = ['ide', 'orden', 'tome']  # ❌ No word boundaries

if 'tome' in text.lower():  # Matches "customer" because "tome" is substring!
    return 'spanish'
```

**Why it fails:**
- "outside" contains "ide" → Incorrectly detected as Spanish
- "order" contains "orde" → Incorrectly detected as Spanish
- "customer" contains "tome" → Incorrectly detected as Spanish

### Fix

**Use Word Boundary Regex**
```python
def detect_language(text: str) -> str:
    """Detect language with word boundary protection"""

    # Spanish characters (definitive)
    if re.search(r'[¿¡áéíóúüñ]', text):
        return 'spanish'

    # Spanish words with WORD BOUNDARIES
    spanish_words = [
        'tome', 'deje', 'dejé', 'puedo', 'puede',  # These caused false positives
        'solo', 'recojo', 'entrego', 'dejaré',
        'hola', 'gracias', 'tengo', 'día'
    ]

    text_lower = text.lower()
    for word in spanish_words:
        # ✅ \b ensures word boundaries
        pattern = r'\b' + re.escape(word) + r'\b'
        if re.search(pattern, text_lower):
            return 'spanish'

    # Explicit English words (for disambiguation)
    english_words = [
        'customer', 'delivery', 'order', 'outside', 'inside',
        'building', 'address', 'door', 'house', 'gate'
    ]

    for word in english_words:
        pattern = r'\b' + re.escape(word) + r'\b'
        if re.search(pattern, text_lower):
            return 'english'

    return 'english'  # Default
```

### Verification Steps
```python
# Test problematic phrases
test_cases = [
    ("customer", "english"),  # NOT spanish (doesn't match \btome\b)
    ("outside", "english"),   # NOT spanish (doesn't match \bide\b)
    ("order", "english"),     # NOT spanish
    ("tome", "spanish"),      # YES spanish (\btome\b matches)
    ("I'll take the order to the customer outside", "english"),
]

for phrase, expected in test_cases:
    result = detect_language(phrase)
    status = "✅" if result == expected else "❌"
    print(f"{status} '{phrase}': {result} (expected {expected})")
```

---

## Issue 4: Metadata in Audio (Format Headers Narrated)

### Symptom
Audio says: "INTRODUCTION", "PHRASE NUMBER ONE:", "[Tone: Warm]", "[Speaker: Spanish narrator]"

### How to Identify
```bash
# Check if script contains metadata
grep -E '\[Tone:|PHRASE|INTRODUCTION' scripts/final-phrases-only/resource-1-complete.txt

# If any results, metadata will be narrated ❌
```

### Root Cause
Extraction doesn't filter metadata markers:

```python
# WRONG - only filters # headers
lines = [line for line in content.split('\n')
         if line.strip() and not line.startswith('#')]
# ❌ Doesn't filter [Tone:], PHRASE, etc.
```

### Fix

**Add Comprehensive Filtering**
```python
def filter_narration_content(lines: List[str]) -> List[str]:
    """Remove metadata and formatting that shouldn't be narrated"""

    filtered = []

    for line in lines:
        line_stripped = line.strip()

        # Skip empty lines
        if not line_stripped:
            continue

        # Skip markdown headers
        if line_stripped.startswith('#'):
            continue

        # Skip horizontal rules
        if line_stripped.startswith(('---', '===', '━━━')):
            continue

        # Skip metadata markers
        metadata_markers = [
            '[Tone:', '[Speaker:', '[PAUSE:', '[Pause:',
            '[Sound', '[Background', '[Music'
        ]
        if any(marker in line for marker in metadata_markers):
            continue

        # Skip section headers (case insensitive)
        line_upper = line_stripped.upper()
        if line_upper.startswith(('INTRODUCTION', 'SECTION', 'PHRASE', 'CONCLUSION')):
            continue

        # Skip bold formatting markers
        if line_stripped.startswith('**') and line_stripped.endswith('**'):
            continue

        # Keep everything else
        filtered.append(line_stripped)

    return filtered
```

### Verification Steps
```bash
# 1. Re-run extraction with filtering
python scripts/extract-phrases.py --resource 1 --filter

# 2. Verify no metadata in output
grep -E '\[Tone:|\[Speaker:|PHRASE|INTRODUCTION' \
  scripts/final-phrases-only/resource-1-complete.txt

# Should return NOTHING (no matches) ✅
```

---

## Issue 5: Duplicate Audio Content

### Symptom
Multiple resources have identical audio despite different topics (e.g., Resource 1 and Resource 5).

### How to Identify
```bash
# Check for duplicate MD5 hashes
md5sum public/audio/resource-*.mp3 | awk '{print $1}' | sort | uniq -d

# If any output, you have duplicates ❌
# Example: 317b67c9da39e83724ad173dcee27216 (Resources 1 and 5)
```

### Root Cause
Using generic placeholder scripts instead of extracting from actual source files:

```python
# WRONG - hardcoded file mapping to placeholder
file_mapping = {
    1: 'scripts/generic-delivery.txt',  # ❌ Not the actual source!
    5: 'scripts/generic-delivery.txt'   # ❌ Same as Resource 1!
}
```

### Fix

**Always Extract from Source Markdown**
```python
# CORRECT - map to actual source files
SOURCE_MAPPING = {
    1: 'generated-resources/50-batch/repartidor/basic_phrases_1.md',
    4: 'generated-resources/50-batch/repartidor/basic_phrases_2.md',
    5: 'generated-resources/50-batch/repartidor/complex_situations_1.md',
    7: 'generated-resources/50-batch/conductor/basic_phrases_1.md',
    # ... etc for all 56 resources
}

def extract_phrases_for_resource(resource_id: int):
    """Extract phrases from actual source, not placeholders"""

    source_file = SOURCE_MAPPING.get(resource_id)
    if not source_file or not os.path.exists(source_file):
        raise ValueError(f"No source file for resource {resource_id}")

    # Extract from actual source
    phrases = extract_all_phrases_from_markdown(source_file)

    return phrases
```

### Verification Steps
```bash
# 1. Re-extract all resources from source
for i in {1..56}; do
  python scripts/extract-phrases.py --resource $i --from-source
done

# 2. Check for duplicates
md5sum public/audio/resource-*.mp3 | awk '{print $1}' | sort | uniq -d

# Should return NOTHING (all unique) ✅

# 3. Verify content is topic-specific
# Resource 1 should mention "delivery", "entrega"
head -20 scripts/final-phrases-only/resource-1-complete.txt

# Resource 5 should mention "complex", "problem"
head -20 scripts/final-phrases-only/resource-5-complete.txt

# Should be DIFFERENT ✅
```

---

## Common Fix Patterns

### Pattern 1: Quote-Based Extraction

For any script that should only extract spoken text:

```python
import re

def extract_spoken_text(content: str) -> List[str]:
    """Extract only text within double quotes (actual spoken content)"""

    spoken_segments = []

    for line in content.split('\n'):
        # Extract all quoted text
        quote_pattern = r'"([^"]+)"'
        quotes = re.findall(quote_pattern, line)

        for quote in quotes:
            clean_text = quote.strip()

            # Skip very short quotes (likely not real content)
            if len(clean_text) >= 5:
                spoken_segments.append(clean_text)

    return spoken_segments
```

### Pattern 2: Word Boundary Matching

For any language detection or word matching:

```python
import re

def contains_word(text: str, word: str) -> bool:
    """Check if text contains word as a complete word, not substring"""
    pattern = r'\b' + re.escape(word) + r'\b'
    return bool(re.search(pattern, text, re.IGNORECASE))

# Usage
contains_word("customer service", "tome")  # False ✅
contains_word("tome el pedido", "tome")    # True ✅
```

### Pattern 3: Multi-Pattern Extraction

For extracting phrases from varied markdown formats:

```python
def extract_phrases_flexible(content: str) -> List[Dict]:
    """Try multiple patterns to extract bilingual phrases"""

    phrases = []

    # Pattern 1: Box format
    pattern1 = r'│\s*\*\*English\*\*:\s*"([^"]+)".*?│\s*🗣️\s*\*\*Español\*\*:\s*([^\n]+)'
    matches = re.findall(pattern1, content, re.DOTALL)
    if matches:
        for en, es in matches:
            phrases.append({'english': en.strip(), 'spanish': es.strip()})

    # Pattern 2: Simple format (fallback)
    if not phrases:
        pattern2 = r'\*\*English\*\*:\s*"([^"]+)".*?\*\*Español\*\*:\s*([^\n]+)'
        matches = re.findall(pattern2, content, re.DOTALL)
        for en, es in matches:
            phrases.append({'english': en.strip(), 'spanish': es.strip()})

    # Pattern 3: Bullet format (fallback)
    if not phrases:
        pattern3 = r'-\s*\*\*English\*\*:\s*([^\n]+)\n\s*-\s*\*\*Español\*\*:\s*([^\n]+)'
        matches = re.findall(pattern3, content)
        for en, es in matches:
            phrases.append({'english': en.strip(), 'spanish': es.strip()})

    return phrases
```

---

## Quick Decision Tree

```
Audio Issue?
│
├─ Phrases missing?
│  └─ Issue 1: Remove line limits → extract_all_phrases()
│
├─ Spanish phrase uses English voice?
│  └─ Issue 2: Add delivery words → spanish_words = [..., 'solo', 'recojo']
│
├─ English phrase uses Spanish voice?
│  └─ Issue 3: Use word boundaries → r'\b' + word + r'\b'
│
├─ Metadata narrated?
│  └─ Issue 4: Filter headers → if line.upper().startswith('SECTION')
│
└─ Duplicate content?
   └─ Issue 5: Extract from source → SOURCE_MAPPING[resource_id]
```

---

## Testing Your Fixes

After applying any fix:

```bash
# 1. Re-run extraction
python scripts/extract-phrases.py --resource <ID>

# 2. Re-generate audio
python scripts/generate-audio.py --resource <ID>

# 3. Verify phrase count
# Source phrases
source_count=$(grep -c '\*\*English\*\*:' <source-file>)
# Generated phrases (lines / 6)
gen_count=$(($(wc -l < scripts/final-phrases-only/resource-<ID>-complete.txt) / 6))
echo "Source: $source_count, Generated: $gen_count"
# Should match ✅

# 4. Check audio duration (should be ~0.3-0.5 min per phrase)
ffprobe -i public/audio/resource-<ID>.mp3 -show_entries format=duration -v quiet -of csv="p=0"

# 5. Listen to first 2 minutes
ffplay -t 120 public/audio/resource-<ID>.mp3
# No metadata? ✅
# Correct voices? ✅
# Natural flow? ✅
```

---

## Emergency Rollback

If a fix breaks something:

```bash
# 1. Restore from backup
cp scripts/final-phrases-only-backup/resource-<ID>-complete.txt \
   scripts/final-phrases-only/

# 2. Restore audio
cp public/audio-backup/resource-<ID>.mp3 public/audio/

# 3. Investigate what went wrong before re-attempting
```

---

## Lessons Learned Summary

### DO:
- ✅ Always extract from source markdown files
- ✅ Use word boundary regex (`\b`) for language detection
- ✅ Filter metadata markers before narration
- ✅ Include delivery-specific Spanish vocabulary
- ✅ Test with actual problematic phrases
- ✅ Verify phrase counts match source

### DON'T:
- ❌ Use arbitrary line limits (`:50]`)
- ❌ Use substring matching without word boundaries
- ❌ Narrate metadata, headers, or formatting
- ❌ Use generic placeholder scripts
- ❌ Deploy without verification
- ❌ Assume English/Spanish detection "just works"

---

**Created by**: ChecklistCreator Agent
**Based on**: Root cause analysis of Resources 1, 4, and comprehensive audit findings
**Last Updated**: 2025-11-10
**Status**: Production-Ready Fix Guide
