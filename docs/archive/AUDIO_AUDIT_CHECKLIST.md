# Audio Quality Audit Checklist

**Version**: 1.0
**Date**: 2025-11-10
**Purpose**: Comprehensive manual audit checklist for all 56 audio resources

---

## Overview

This checklist ensures every audio resource contains:
1. **Complete phrase coverage** - All phrases from source markdown
2. **Correct voice detection** - Spanish words use Spanish voice, English words use English voice
3. **Proper audio quality** - No format headers, metadata, or truncation
4. **Structured tutorial format** - Intro → Teaching → Practice → Conclusion

---

## Quick Reference: Common Issues

### Known Voice Detection Problems
- **"outside", "order", "customer"** → Often incorrectly use English voice (contain Spanish substrings)
- **"solo", "recojo", "entrego"** → Often incorrectly use English voice (delivery-specific Spanish)
- **"tome", "deje", "puede"** → Need word boundary matching to prevent false positives

### Known Extraction Problems
- **Format headers** → Should NOT be narrated: "INTRODUCTION", "PHRASE N:", "SECTION"
- **Metadata markers** → Should be filtered: `[Tone:]`, `[Speaker:]`, `[PAUSE:]`
- **Missing phrases** → Truncation at line limits (e.g., `[:50]`)
- **Wrong content** → Using placeholder scripts instead of extracted source

---

## Phase 1: Content Completeness Audit

### For Each Resource (1-56):

#### Step 1: Count Source Phrases
```bash
# Example for Resource 1
grep -c "^## Frase" generated-resources/50-batch/repartidor/basic_phrases_1.md
# OR
grep -c '\*\*English\*\*:' generated-resources/50-batch/repartidor/basic_phrases_1.md
```

**Expected**: 8-30 phrases depending on resource level
- Basic resources: 8-12 phrases
- Intermediate: 15-20 phrases
- Advanced: 20-30 phrases

#### Step 2: Count Extracted Phrases
```bash
# Count phrases in extraction file
wc -l scripts/final-phrases-only/resource-1-complete.txt
# Divide by 6 (intro + en1 + en2 + es + tip + blank = 6 lines per phrase)
```

#### Step 3: Verify 100% Coverage
- [ ] Source phrase count = Extracted phrase count
- [ ] No missing phrase numbers (1, 2, 3... no gaps)
- [ ] First phrase matches source
- [ ] Last phrase matches source (not truncated)

**RED FLAGS**:
- ❌ Extracted phrases < Source phrases → **Incomplete extraction**
- ❌ Missing phrase numbers → **Extraction logic bug**
- ❌ Generic phrases (e.g., "Hi, I have your delivery" in non-delivery resource) → **Wrong source file**

---

## Phase 2: Voice Detection Audit

### Test Known Problematic Phrases

For each resource containing these words, verify correct voice:

#### Spanish Words (Must Use Spanish Voice):
```bash
# Search for Spanish delivery vocabulary
grep -i "solo\|recojo\|entrego\|dejaré\|edificio" scripts/final-phrases-only/resource-*.txt

# Listen to audio at timestamp where these appear
# Should hear: Colombian/Mexican Spanish accent (female voice)
```

**Test phrases**:
- [ ] "Solo recojo y entrego" → Spanish voice ✅
- [ ] "Dejaré aquí" → Spanish voice ✅
- [ ] "Edificio apartamento" → Spanish voice ✅
- [ ] "Puedo esperaré" → Spanish voice ✅

#### English Words with Spanish Substrings (Must Use English Voice):
```bash
# Search for problematic English words
grep -i "outside\|order\|customer\|inside" scripts/final-phrases-only/resource-*.txt

# Listen carefully - common bug is Spanish voice on these
# Should hear: American English accent (female voice)
```

**Test phrases**:
- [ ] "I'm outside" → English voice ✅ (NOT Spanish because of "ide")
- [ ] "Here's your order" → English voice ✅ (NOT Spanish because of "order")
- [ ] "Thank you, customer" → English voice ✅ (NOT Spanish because of "tome" substring)
- [ ] "I'm inside the building" → English voice ✅

#### Word Boundary Fix Verification
```python
# CORRECT pattern (with word boundaries)
r'\b(tome|deje|puede)\b'  # Matches "tome" but NOT "customer"

# WRONG pattern (no word boundaries)
r'(tome|deje|puede)'  # Matches "tome" AND "customer" ❌
```

### Manual Listening Test

For resources 1, 4, 7, 10, 13, 18, 21, 28, 32, 34 (sample):

- [ ] Play first 2 minutes
- [ ] Identify 3-5 Spanish phrases → Check voice is Spanish
- [ ] Identify 3-5 English phrases → Check voice is English
- [ ] No jarring voice switches mid-phrase
- [ ] Pauses sound natural (1-3 seconds)

**HOW TO LISTEN**:
```bash
# Play specific timestamp in audio file
ffplay -ss 00:01:30 public/audio/resource-1.mp3 -t 30

# OR use audio player to skip to minute marks
# 00:00 - Intro (Spanish)
# 01:00 - First phrases (bilingual)
# 05:00 - Practice section (English)
```

---

## Phase 3: Audio Quality Audit

### File Metrics Check

```bash
# Expected file size: 2-7 MB depending on phrase count
ls -lh public/audio/resource-*.mp3 | awk '{print $5, $9}'

# Expected duration: 4-12 minutes
for f in public/audio/resource-*.mp3; do
  echo "$f: $(ffprobe -i "$f" -show_entries format=duration -v quiet -of csv="p=0" | awk '{print int($1/60)":"int($1%60)}')"
done
```

#### File Size Expectations
- 8 phrases × 6 lines each × ~3 sec/line = **~2-3 minutes** → **2-3 MB**
- 15 phrases = **~5-6 minutes** → **4-5 MB**
- 30 phrases = **~10-12 minutes** → **7-10 MB**

**Audit Checks**:
- [ ] File size reasonable for phrase count (see table above)
- [ ] Duration matches expected (20-30 sec per phrase)
- [ ] No 0-byte files
- [ ] No duplicate file sizes (all resources should be unique)
- [ ] No suspiciously small files (<1 MB = likely incomplete)

### Content Structure Check

Listen to 3 sample resources (beginning, middle, end):

#### ✅ CORRECT Structure:
```
00:00-00:50: [Spanish] Welcome introduction
00:50-05:00: [Bilingual] Teaching section
             - Spanish context
             - English phrase (TWICE, slowly)
             - Spanish translation + tip
05:00-06:30: [English] Quick practice (all phrases at normal speed)
06:30-07:00: [Spanish] Motivational conclusion
```

#### ❌ WRONG Indicators:
- Narrates metadata: "Tone: Warm", "Speaker: Spanish narrator"
- Narrates format headers: "INTRODUCTION", "PHRASE NUMBER ONE"
- No repetition of English phrases (should hear each twice)
- Missing sections (e.g., no practice section)
- Cuts off mid-phrase (truncation)

---

## Phase 4: Known Issues Checklist

### Issue 1: Format Headers in Audio

**Symptom**: Audio says "INTRODUCTION", "PHRASE ONE:", "SECTION TWO"

**Root Cause**: Extraction script includes section headers
```python
# WRONG
lines = [line for line in content.split('\n') if line.strip()]

# CORRECT
lines = [line for line in content.split('\n')
         if line.strip() and not line.upper().startswith(('SECTION', 'PHRASE', 'INTRODUCTION'))]
```

**Fix**: Filter lines in extraction script before audio generation

**Verification**:
- [ ] No section headers narrated
- [ ] No "PHRASE N:" in audio
- [ ] No "INTRODUCTION", "CONCLUSION" labels spoken

---

### Issue 2: Metadata in Audio

**Symptom**: Audio says "[Tone: Warm]", "[Speaker: Spanish narrator]", "[PAUSE: 2 seconds]"

**Root Cause**: Extraction script doesn't filter metadata markers
```python
# WRONG
if not line.startswith('#'):  # Only filters markdown headers

# CORRECT
metadata_markers = ['[Tone:', '[Speaker:', '[PAUSE:', '[Sound', '[Background']
if not any(marker in line for marker in metadata_markers):
```

**Fix**: Add metadata marker filtering

**Verification**:
- [ ] No "[Tone:..." in audio
- [ ] No "[Speaker:..." in audio
- [ ] No "[PAUSE:..." in audio
- [ ] No stage directions narrated

---

### Issue 3: Wrong Voice Detection

**Symptom**: English phrase "I'm outside" uses Spanish voice

**Root Cause**: Simple substring matching without word boundaries
```python
# WRONG - matches "outside" because it contains "ide"
if 'ide' in text.lower():
    return 'spanish'

# CORRECT - word boundary matching
import re
if re.search(r'\bide\b', text.lower()):
    return 'spanish'
```

**Affected Words**:
- "outside" → matches "ide" ❌
- "order" → matches "orden" ❌
- "customer" → matches "tome" ❌

**Fix**: Use `\b` word boundaries in regex patterns

**Verification**:
- [ ] "outside" → English voice
- [ ] "order" → English voice
- [ ] "customer" → English voice
- [ ] "solo" → Spanish voice
- [ ] "recojo" → Spanish voice
- [ ] "entrego" → Spanish voice

---

### Issue 4: Missing Phrases

**Symptom**: Audio only contains 10 phrases but source has 20

**Root Cause**: Arbitrary line limit in extraction
```python
# WRONG - cuts off at 50 lines
return '\n'.join(lines[:50])

# CORRECT - include all phrases
return '\n'.join(lines)
```

**Verification**:
- [ ] Phrase count matches source (100% coverage)
- [ ] Last phrase in audio = Last phrase in source
- [ ] No sudden ending mid-lesson

---

### Issue 5: Duplicate Audio Content

**Symptom**: Resource 1 and Resource 5 have identical audio despite different topics

**Root Cause**: Using generic placeholder scripts instead of extracting from source

**Fix**: Always extract from source markdown in `generated-resources/50-batch/`

**Verification**:
```bash
# Check for duplicate audio files
md5sum public/audio/resource-*.mp3 | awk '{print $1}' | sort | uniq -d
# Should return NOTHING (no duplicates)
```

- [ ] All audio files have unique MD5 hashes
- [ ] Content matches resource topic
- [ ] First phrase is topic-specific (not generic)

---

## Quick Audit Script

For fast verification of all resources:

```bash
#!/bin/bash
# Quick audit of all 56 resources

echo "=== AUDIO QUALITY QUICK AUDIT ==="
echo

# 1. File existence check
echo "1. Checking file existence..."
for i in {1..56}; do
  if [ ! -f "public/audio/resource-$i.mp3" ]; then
    echo "  ❌ Missing: resource-$i.mp3"
  fi
done

# 2. File size check (should be >1MB)
echo "2. Checking file sizes..."
for i in {1..56}; do
  size=$(stat -f%z "public/audio/resource-$i.mp3" 2>/dev/null || stat -c%s "public/audio/resource-$i.mp3" 2>/dev/null)
  if [ "$size" -lt 1048576 ]; then
    echo "  ⚠️  Small file: resource-$i.mp3($(($size/1024))KB)"
  fi
done

# 3. Duplicate detection
echo "3. Checking for duplicates..."
duplicates=$(md5sum public/audio/resource-*.mp3 | awk '{print $1}' | sort | uniq -d)
if [ -n "$duplicates" ]; then
  echo "  ❌ Found duplicate audio files!"
else
  echo "  ✅ All files unique"
fi

# 4. Duration check (should be >2 minutes)
echo "4. Checking durations..."
for i in {1..56}; do
  duration=$(ffprobe -i "public/audio/resource-$i.mp3" -show_entries format=duration -v quiet -of csv="p=0")
  if (( $(echo "$duration < 120" | bc -l) )); then
    echo "  ⚠️  Short duration: resource-$i.mp3 (${duration}s)"
  fi
done

echo
echo "=== AUDIT COMPLETE ==="
```

---

## Final Verification Checklist

Before marking resource as COMPLETE:

- [ ] **Content**: Phrase count matches source (100% coverage)
- [ ] **Voice**: Spanish words use Spanish voice, English use English voice
- [ ] **Quality**: No metadata, headers, or stage directions in audio
- [ ] **Structure**: Intro → Teaching → Practice → Conclusion
- [ ] **File**: Size appropriate for phrase count (2-10 MB)
- [ ] **Duration**: Reasonable for content (4-12 minutes)
- [ ] **Uniqueness**: Audio content matches resource topic (not duplicate)
- [ ] **Completeness**: No truncation, all phrases through to end

---

## Status Tracking

Create a simple tracking sheet:

```
Resource | Phrases | Duration | File Size | Voice OK | Content OK | Status
---------|---------|----------|-----------|----------|------------|--------
1        | 8       | 4:30     | 3.2 MB    | ✅       | ✅         | PASS
2        | 8       | 4:25     | 3.1 MB    | ✅       | ❌ [metadata] | NEEDS FIX
4        | 15      | 7:15     | 5.8 MB    | ❌ [solo] | ✅         | NEEDS FIX
...
```

**Pass Criteria**: All checkmarks = ✅ PASS
**Fail Criteria**: Any ❌ = NEEDS FIX

---

## When to Request Regeneration

Request full regeneration if:
- [ ] More than 10 resources need fixes
- [ ] Critical resources (1-10) have issues
- [ ] Systematic problem found (e.g., all voices wrong)

Request individual fix if:
- [ ] Single resource has issue
- [ ] Quick fix available (update source file only)
- [ ] Most resources are correct

---

## Appendix: Testing Resources by Priority

### High Priority (Test First)
1. **Resource 1**: Basic delivery phrases (most used)
2. **Resource 4**: Delivery situations (common issues)
3. **Resource 7**: Rider basics (different domain)
4. **Resource 21**: General greetings (baseline)

### Medium Priority
- Resources 10, 13, 18, 28, 32

### Low Priority
- Resources 38-56 (already verified correct in previous audit)

---

**Created by**: ChecklistCreator Agent
**Based on**: Lessons from Resource 1, 4 audits and comprehensive issue analysis
**Last Updated**: 2025-11-10
