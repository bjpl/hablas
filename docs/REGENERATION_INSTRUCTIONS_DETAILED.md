# Detailed Regeneration Instructions for Problem Resources

**Hablas Platform - Resources 5, 6, 7, 10, 13, 18, 20**
**Date**: November 3, 2025
**Based on**: AUDIO_QUALITY_STANDARDS.md - Category C1 (No Technical Metadata)

---

## Resource 5: Situaciones Complejas en Entregas - Var 1

**File**: `C:\Users\brand\Development\Project_Workspace\active-development\hablas\scripts\final-phrases-only\resource-5.txt`
**Issue**: Truncated first phrase (incomplete sentence)
**Severity**: MODERATE (A2 Phrase Accuracy violation)
**Fix Duration**: 3 minutes

### Current State
```
Line 1: Can you double-check this order? The

Line 2: (blank)

Line 3: Can you double-check this order? The

Line 4: (blank)

Line 5: ¿Puede verificar este pedido dos veces?
```

### Problem
- First phrase incomplete: "The" stands alone
- Missing object/context after "The"
- Student won't understand what "The" refers to
- Spanish translation doesn't match (doesn't clarify what was needed)

### Solution
Complete the phrase with context. Options:
```
✅ Can you double-check this order? The customer specifically asked for extra sauce.
✅ Can you double-check this order? The items need to be verified.
✅ Can you double-check this order? The total seems high.
```

Recommend first option (most practical).

### Steps to Fix
1. Open: `scripts/final-phrases-only/resource-5.txt`
2. Find: Lines 1, 3 (both have incomplete phrase)
3. Replace:
   ```
   OLD: Can you double-check this order? The
   NEW: Can you double-check this order? The customer specifically asked for extra sauce.
   ```
4. Apply to both lines 1 AND 3 (ensure consistency)
5. Verify: Lines 1-5 now form complete phrase structure
6. Update Spanish translation to match (line 5):
   ```
   OLD: ¿Puede verificar este pedido dos veces?
   NEW: ¿Puede verificar este pedido dos veces? El cliente pidió salsa adicional específicamente.
   ```

### Verification
After fix:
```
Line 1: Can you double-check this order? The customer specifically asked for extra sauce.
Line 2: (blank)
Line 3: Can you double-check this order? The customer specifically asked for extra sauce.
Line 4: (blank)
Line 5: ¿Puede verificar este pedido dos veces? El cliente pidió salsa adicional específicamente.
```

---

## Resource 6: Frases Esenciales para Entregas - Var 3

**File**: `C:\Users\brand\Development\Project_Workspace\active-development\hablas\scripts\final-phrases-only\resource-6.txt`
**Issue**: Placeholder syntax not replaced with example values
**Severity**: HIGH (A2 Phrase Accuracy violation - students hear "[customer name]" literally)
**Fix Duration**: 5 minutes

### Current State - Issue Locations

**Issue #1 - Lines 13-17**:
```
Line 13: Order for [customer name].
Line 14: (blank)
Line 15: Order for [customer name].
Line 16: (blank)
Line 17: Orden para [nombre del cliente]
```

**Issue #2 - Lines 19-23**:
```
Line 19: Order number [####].
Line 20: (blank)
Line 21: Order number [####].
Line 22: (blank)
Line 23: Número de orden [####]
```

**Issue #3 - Lines 73-77**:
```
Line 73: Are you [customer name]?
Line 74: (blank)
Line 75: Are you [customer name]?
Line 76: (blank)
Line 77: ¿Eres [nombre del cliente]?
```

### Problems
- TTS will read "[customer name]" as audio
- Student hears brackets and thinks that's correct
- Not practical - doesn't show real usage
- Violates E1 (Consistent Structure) and A2 (Phrase Accuracy)

### Solution
Replace ALL placeholders with specific examples:
- `[customer name]` → Use realistic names (Michael, Sarah, Juan, etc.)
- `[####]` → Use realistic order numbers (4523, 1200, 9876, etc.)

### Steps to Fix

**Step 1: Fix Issue #1 (Lines 13-17)**
```
Replace:
  Line 13: Order for [customer name].
  Line 15: Order for [customer name].
  Line 17: Orden para [nombre del cliente]

With:
  Line 13: Order for Michael.
  Line 15: Order for Michael.
  Line 17: Orden para Michael.
```

**Step 2: Fix Issue #2 (Lines 19-23)**
```
Replace:
  Line 19: Order number [####].
  Line 21: Order number [####].
  Line 23: Número de orden [####]

With:
  Line 19: Order number 4523.
  Line 21: Order number 4523.
  Line 23: Número de orden 4523.
```

**Step 3: Fix Issue #3 (Lines 73-77)**
```
Replace:
  Line 73: Are you [customer name]?
  Line 75: Are you [customer name]?
  Line 77: ¿Eres [nombre del cliente]?

With:
  Line 73: Are you Sarah?
  Line 75: Are you Sarah?
  Line 77: ¿Eres Sarah?
```

### Verification
After fixes:
- No `[` or `]` brackets remaining (except if in content)
- All names filled in: Michael, Sarah, etc.
- All numbers filled in: 4523, etc.
- Spanish translations match English names/numbers
- File is learner-ready (can be spoken by TTS)

---

## Resource 7: Pronunciación: Entregas - Var 2

**File**: `C:\Users\brand\Development\Project_Workspace\active-development\hablas\scripts\final-phrases-only\resource-7.txt`
**Issue**: Metadata marker on first line
**Severity**: LOW (borderline C1 violation)
**Fix Duration**: 1 minute

### Current State
```
Line 1: **Focus**: Essential delivery phrases with clear pronunciation
Line 2: (blank)
Line 3: "¡Hola! Bienvenido a Hablas. Soy tu instructor de inglés para repartidores.
...
```

### Problem
- First line contains `**Focus**:` - Markdown formatting
- Instructional metadata (tells instructor what focus is)
- Not learner-facing content
- Students would read/hear "**Focus**:" which is confusing

### Solution
Remove line 1 completely. The rest of the file (narration + phrases) is learner-appropriate.

### Steps to Fix
1. Open: `scripts/final-phrases-only/resource-7.txt`
2. Delete: Line 1 entirely
   ```
   ❌ **Focus**: Essential delivery phrases with clear pronunciation
   ```
3. Line 2 (blank) becomes new Line 1
4. Line 3 (narration start) becomes new Line 2
5. Save file

### Verification
After fix:
- File starts with blank line (or with narration if blank removed too)
- No `**Focus**:` or similar markers
- First actual content line is narration: `"¡Hola! Bienvenido a Hablas...`
- File ready for TTS conversion

---

## Resource 20: Manejo de Situaciones Difíciles - Var 1

**File**: `C:\Users\brand\Development\Project_Workspace\active-development\hablas\scripts\final-phrases-only\resource-20.txt`
**Issue**: Truncated first phrase (incomplete sentence)
**Severity**: MODERATE (A2 Phrase Accuracy violation)
**Fix Duration**: 3 minutes

### Current State
```
Line 1: No problem. You can cancel through the

Line 2: (blank)

Line 3: No problem. You can cancel through the

Line 4: (blank)

Line 5: No hay problema. Puedes cancelar a
```

### Problem
- First phrase incomplete: "...through the" (missing object)
- Second phrase ends with "a" (missing object in Spanish too)
- Student can't complete the action
- Neither makes sense

### Solution
Complete both phrases with: "...through the app"

### Steps to Fix
1. Open: `scripts/final-phrases-only/resource-20.txt`
2. Update Lines 1, 3, 5:
   ```
   OLD Line 1: No problem. You can cancel through the
   NEW Line 1: No problem. You can cancel through the app.

   OLD Line 3: No problem. You can cancel through the
   NEW Line 3: No problem. You can cancel through the app.

   OLD Line 5: No hay problema. Puedes cancelar a
   NEW Line 5: No hay problema. Puedes cancelar a través de la app.
   ```

### Verification
After fix:
```
Line 1: No problem. You can cancel through the app.
Line 2: (blank)
Line 3: No problem. You can cancel through the app.
Line 4: (blank)
Line 5: No hay problema. Puedes cancelar a través de la app.
```

---

## Resources 10, 13, 18: Production Metadata Removal (CRITICAL)

These three resources require COMPLETE REBUILD. They contain 130+ production metadata markers mixed throughout learner content.

### Resource 10: Conversaciones con Clientes - Var 1
**File**: `scripts/final-phrases-only/resource-10.txt`
**Size**: 420 lines
**Issue**: Extreme metadata contamination
**Severity**: CRITICAL
**Fix Duration**: 45 minutes

### Resource 13: Audio: Direcciones en Inglés - Var 1
**File**: `scripts/final-phrases-only/resource-13.txt`
**Size**: 404 lines
**Issue**: Extensive metadata contamination
**Severity**: CRITICAL
**Fix Duration**: 30 minutes

### Resource 18: Audio: Direcciones en Inglés - Var 2
**File**: `scripts/final-phrases-only/resource-18.txt`
**Size**: 368 lines
**Issue**: Extensive metadata contamination
**Severity**: CRITICAL
**Fix Duration**: 40 minutes

---

## Detailed Metadata Removal Process (Resources 10, 13, 18)

### Step 1: Identify Content Layers

Each resource has this structure:
```
[Metadata headers]
  **Level**: ...
  **Category**: ...
  **Duration**: ...

[Code block markers]
  ```

[Narration with speaker tags]
  [Speaker: Spanish narrator]
  "¡Hola! Bienvenido..."

[Phrase blocks with metadata]
  [00:00] TIMESTAMP
  [Tone: ...]
  [Speaker: English]
  "English phrase"
  [Phonetic: ...]
  [PAUSE: ...]
  "English repeat"
  [Speaker: Spanish]
  "Spanish translation"
```

### Step 2: Extraction Method

**For Narration Blocks** (beginning of file):
```
KEEP: "¡Hola! Bienvenido a Hablas. Soy tu instructor..."
REMOVE: [Speaker: Spanish narrator - friendly voice]
REMOVE: [Tone: Warm, encouraging]
KEEP: Teaching context, recommendations
```

**For Phrase Blocks** (repeated pattern):
```
KEEP: "Hi! I have your delivery from Chipotle"
REMOVE: [00:00] PHRASE 1: ARRIVING AT LOCATION
REMOVE: [Tone: Professional, friendly]
REMOVE: [Speaker: English - Native, 80% speed]
REMOVE: [PAUSE: 3 seconds]
REMOVE: [Phonetic: JAI! AI JAV YOR...]
KEEP: "Hi! I have your delivery from Chipotle" (repeat)
KEEP: "¡Hola! Tengo su entrega de Chipotle." (Spanish)
KEEP: "Consejo: Siempre menciona el nombre..." (teaching tip)
```

### Step 3: Automated Detection

These patterns should ALL be removed:
```
Pattern: [ANYTHING]
Examples:
  [00:00]
  [00:45]
  [02:00]
  [Tone: ...]
  [Speaker: ...]
  [PAUSE: ...]
  [Phonetic: ...]

Pattern: **ANYTHING**:
Examples:
  **Level**:
  **Category**:
  **Duration**:
  **Focus**:

Pattern: ## ANYTHING
Examples:
  ## FULL AUDIO SCRIPT
  ## COMPLETE AUDIO SCRIPT

Pattern: Single ``` (code block markers)
```

### Step 4: Clean Output Format

Target format for each phrase block:
```
"Frase X: Cuando [scenario description]"

"English phrase"

"English phrase"

"Traducción/Spanish translation"

"Additional context/tip"

[blank line]
```

NO BRACKETS, NO METADATA, NO TIMESTAMPS.

### Step 5: Validation

After removing metadata:
- [ ] grep -n "\[" file.txt → Should show 0 results (no brackets)
- [ ] grep -n "\*\*" file.txt → Should show 0 or acceptable markdown only
- [ ] grep -n "PRODUCTION\|Voice Casting\|Tone:\|Speaker:\|PAUSE:" file.txt → Should show 0
- [ ] Line count reduced by 50%+ (metadata removal)
- [ ] File < 500 lines
- [ ] First content line is narration or phrase (not metadata)
- [ ] Last content line is phrase or tip (not metadata)

### Step 6: Phrase Extraction Script

For reference, metadata markers to remove:

**Resource 10 Examples**:
```
❌ [00:00] INTRODUCTION
❌ [Tone: Warm, encouraging, energetic]
❌ [Speaker: Spanish narrator - friendly voice]
❌ [PAUSE: 2 seconds]
❌ [00:45] PHRASE 1: ARRIVING AT LOCATION
❌ [Speaker: English - Native, 80% speed, clear pronunciation]
❌ [Phonetic: JAI! AI JAV YOR de-LI-ve-ri FROM chi-POT-le]
❌ [PAUSE: 3 seconds - for student repetition]
❌ [Speaker: Spanish - Tip]
✅ "¡Hola! Bienvenido a Hablas. Soy tu instructor para esta lección."
✅ "Hi! I have your delivery from Chipotle."
✅ "¡Hola! Tengo su entrega de Chipotle."
✅ "Consejo: Siempre menciona el nombre del restaurante."
```

**Resource 13 Examples** (same patterns, different phrases):
```
❌ **Duration**: 7:15 minutes
❌ **Level**: Básico
❌ **Category**: Conductores
❌ ## COMPLETE AUDIO SCRIPT
```

**Resource 18 Examples** (same patterns):
```
❌ [Speaker: English - Repeat]
❌ [Speaker: Spanish - Tip]
❌ [00:XX] timestamps
```

---

## Batch Processing Recommendation

### Option A: Manual Line-by-Line
- Fastest for Resources 5, 6, 7, 20 (minor fixes)
- Time: 12 minutes total
- Accuracy: 100%
- Method: Edit file directly

### Option B: Automated for Resources 10, 13, 18
- Use bash/python to remove patterns
- Time: 30 minutes total
- Accuracy: 95%+ with manual verification
- Method: Script-based removal

### Option C: Complete Rebuild (Most Reliable)
- Extract pure phrases from source markdown
- Rebuild clean script from scratch
- Time: 2 hours total
- Accuracy: 100%
- Method: Parse source files directly

**Recommendation**:
- Use Option A for Resources 5, 6, 7, 20 (quick manual edits)
- Use Option C for Resources 10, 13, 18 (ensures quality)

---

## Success Criteria - After Regeneration

### Resource 5
- [ ] Lines 1, 3: Complete phrase ending with "extra sauce" context
- [ ] Line 5: Spanish translation updated
- [ ] No truncation

### Resource 6
- [ ] Lines 13, 15: "Order for Michael"
- [ ] Lines 19, 21: "Order number 4523"
- [ ] Lines 73, 75: "Are you Sarah?"
- [ ] Lines 17, 23, 77: Spanish updated to match
- [ ] No brackets [ ]

### Resource 7
- [ ] Line 1 removed
- [ ] File starts with narration or blank line
- [ ] No **Focus**: marker

### Resource 20
- [ ] Lines 1, 3: "...through the app."
- [ ] Line 5: "...a través de la app."
- [ ] No truncation

### Resources 10, 13, 18
- [ ] All [timestamps] removed
- [ ] All [Tone: ...] removed
- [ ] All [Speaker: ...] removed
- [ ] All [PAUSE: ...] removed
- [ ] All [Phonetic: ...] removed
- [ ] All **metadata**: removed
- [ ] All code block ``` removed
- [ ] Pure learner content remains
- [ ] EN-EN-SP pattern consistent
- [ ] File size reduced 40-50%

---

## Testing Each Fix

After making each edit:

### For Simple Fixes (5, 6, 7, 20)
```bash
# Verify no forbidden markers
grep -i "PRODUCTION\|Voice Casting\|\[Tone:\|\[Speaker:\|PAUSE:" resource-X.txt
# Should return: (no results)

# Verify phrase completeness
head -5 resource-X.txt | tail -1
# Should show: Complete phrase ending with punctuation
```

### For Complex Fixes (10, 13, 18)
```bash
# Verify metadata removal
grep "\[" resource-X.txt | wc -l
# Should return: 0 (or very low number)

# Verify file still has content
wc -l resource-X.txt
# Should show: 200-400 lines (depends on resource)

# Verify structure
grep -c "English phrase\|¿.*?" resource-X.txt
# Should show: 15+ (indicates phrases remain)
```

---

## Estimated Timeline

| Task | Time | Complexity |
|------|------|-----------|
| Resource 5 fix | 3 min | Trivial |
| Resource 6 fix | 5 min | Simple |
| Resource 7 fix | 1 min | Trivial |
| Resource 20 fix | 3 min | Trivial |
| **Subtotal (Quick fixes)** | **12 min** | **Easy** |
| Resource 10 rebuild | 45 min | Complex |
| Resource 13 rebuild | 30 min | Complex |
| Resource 18 rebuild | 40 min | Complex |
| **Subtotal (Full rebuilds)** | **115 min (1:55)** | **Hard** |
| Re-audit all 7 | 30 min | Medium |
| Audio regeneration | 30 min | Medium |
| Sample verify | 15 min | Medium |
| **TOTAL** | **3:42** | |

---

## File Locations

```
Base Path: C:\Users\brand\Development\Project_Workspace\active-development\hablas

Scripts to Edit:
  scripts/final-phrases-only/resource-5.txt
  scripts/final-phrases-only/resource-6.txt
  scripts/final-phrases-only/resource-7.txt
  scripts/final-phrases-only/resource-10.txt
  scripts/final-phrases-only/resource-13.txt
  scripts/final-phrases-only/resource-18.txt
  scripts/final-phrases-only/resource-20.txt

Audit Documents:
  docs/AUDIO_QUALITY_STANDARDS.md
  docs/AUDIT_RESOURCES_1-20_FINDINGS.md
  docs/AUDIT_SUMMARY_RESOURCES_1-20.md
  docs/REGENERATION_INSTRUCTIONS_DETAILED.md (this file)
```

---

## Next Steps

1. Choose Option A (manual) or C (rebuild)
2. Fix Resources 5, 6, 7, 20 first (quick wins)
3. Rebuild Resources 10, 13, 18 (time investment but guaranteed quality)
4. Run validation checks for each
5. Re-audit using AUDIO_QUALITY_STANDARDS.md
6. Generate new audio files
7. Sample listen to verify quality
8. Deploy when all pass standards

---

**Questions?** Refer to the complete audit document for scoring methodology and standards.
