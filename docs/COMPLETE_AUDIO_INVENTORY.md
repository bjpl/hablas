# Complete Audio Inventory & Action Plan
**Date**: November 1, 2025
**Total Audio Files**: 49

---

## 📊 **Audio File Breakdown**

### **Single-Language Files (12) - Already Correct** ✅:
These are Spanish-only or English-only, no dual-voice needed:
- `emergencia-var1-es.mp3` (Spanish only)
- `emergency-var1-en.mp3` (English only)
- `emergency-var2-en.mp3` (English only)
- `frases-esenciales-var1-es.mp3` (Spanish only)
- `frases-esenciales-var2-es.mp3` (Spanish only)
- `frases-esenciales-var3-es.mp3` (Spanish only)
- `numeros-direcciones-var1-es.mp3` (Spanish only)
- `numeros-direcciones-var2-es.mp3` (Spanish only)
- `saludos-var1-en.mp3` (English only)
- `saludos-var2-en.mp3` (English only)
- `saludos-var3-en.mp3` (English only)
- `tiempo-var1-es.mp3` (Spanish only)

### **Bilingual Files - resource-1 through resource-37 (37)**:

**FIXED (9) - Pure Dialogue Dual-Voice** ✅:
- resource-2 (4.8 MB)
- resource-7 (4.9 MB)
- resource-10 (5.7 MB)
- resource-13 (2.3 MB)
- resource-18 (2.9 MB)
- resource-21 (1.3 MB)
- resource-28 (1.0 MB)
- resource-32 (5.0 MB)
- resource-34 (5.3 MB)

**NEED FIXING (28) - Still Spanish Voice Saying English** ❌:
- resource-1, 3, 4, 5, 6, 8, 9
- resource-11, 12, 14, 15, 16, 17, 19, 20
- resource-22, 23, 24, 25, 26, 27, 29, 30, 31, 33
- resource-35, 36, 37

---

## 🎯 **Challenge**

**Problem**: Only 9 resources have source audio-script.txt files
**Reality**: 37 bilingual audio files exist
**Gap**: 28 audio files with no source scripts

**These 28 were likely generated from**:
- The markdown resource content itself
- Or standalone TTS of resource content
- Or old generation scripts that are gone

---

## 💡 **Solution Strategy**

### **Option A: Extract Dialogue from Markdown** (RECOMMENDED)

**For the 28 without scripts**:
1. Read the markdown resource content (data shows contentPath)
2. Extract English/Spanish phrase pairs from markdown
3. Create pure dialogue scripts
4. Generate dual-voice SSML
5. Regenerate audio

**Effort**: 2-3 hours (automated script)
**Result**: All 37 bilingual files with native pronunciation

### **Option B: Focus on Most Used**

**Priority approach**:
1. Identify top 10 most-used resources (basic, essentials)
2. Fix those 10 first
3. Defer others

**Effort**: 30-60 minutes
**Result**: Critical audio fixed, others can wait

### **Option C: Remove Unfixed Audio**

**Pragmatic approach**:
1. Keep the 9 with perfect dual-voice
2. Remove audioUrl for the 28 without scripts
3. They become text-only resources (still valuable)
4. Can add audio later when we have better source

**Effort**: 15 minutes
**Result**: Only high-quality audio available

---

## 🎯 **My Recommendation**

**Option C** for now (pragmatic):
- Keep 9 perfect dual-voice audio files
- Remove audioUrl from the 28 without source scripts
- Focus on quality over quantity
- Students get perfect audio for key resources

Then later (when you have time):
- Extract dialogue from markdown
- Regenerate remaining 28 properly

**Why**: Better to have 9 perfect than 37 mediocre

---

**What do you want?**
A. Extract dialogue from all 37 and fix everything (2-3 hours)
B. Focus on top 10 only (1 hour)
C. Keep 9 perfect, remove others for now (15 min)
