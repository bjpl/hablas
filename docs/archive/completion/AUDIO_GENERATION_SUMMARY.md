# Audio Generation Summary - Quick Reference

**Date:** 2025-11-02
**Status:** Research Complete ✅
**Next Action:** Begin Phase 1 Audio Generation

---

## Current Status

```
Total Resources: 59
├── With Audio:     9 ✅ (15%)
├── Ready to Gen:  28 🟢 (48%)
└── Need Extract:  22 🟡 (37%)
```

---

## The Simple Answer

**You asked:** Map all 59 resources to source content for audio generation

**The answer:**
- **9 resources** already have audio (IDs: 2, 7, 10, 13, 18, 21, 28, 32, 34) ✅
- **28 resources** have phrase files ready - can generate audio TODAY (IDs: 1, 3-6, 8-9, 11-12, 14-17, 19-20, 22-27, 29-31, 33, 35-37) 🟢
- **22 resources** need phrase extraction first, then audio generation (IDs: 38-59) 🟡

**All source content exists and is mapped.**

---

## What Needs to Happen (3 Steps)

### Step 1: Generate 28 Audio Files (2-3 hours)
**Resources:** 1, 3-6, 8-9, 11-12, 14-17, 19-20, 22-27, 29-31, 33, 35-37

These already have phrase files in `scripts/final-phrases-only/`

**Command:**
```bash
node scripts/generate-audio-from-phrases.js --batch 1,3-6,8-9,11-12,14-17,19-20,22-27,29-31,33,35-37
```

**Output:** 28 new MP3 files in `public/audio/`

---

### Step 2: Extract Phrases for Remaining 22 Resources (2-3 hours)
**Resources:** 38-59

Need to create phrase extraction script that:
1. Reads markdown files from `docs/resources/converted/`
2. Extracts "Essential Phrases" sections
3. Formats as dual-voice script (English, English, Spanish)
4. Saves to `scripts/final-phrases-only/resource-[ID].txt`

**Script Template:**
```javascript
// scripts/extract-phrases-from-markdown.js
function extractPhrasesFromMarkdown(markdownPath) {
  const content = fs.readFileSync(markdownPath, 'utf8');
  const phraseRegex = /###\s+\d+\.\s+(.+?)\n\s*\*\*Spanish:\*\*\s+(.+?)\n/gs;

  const phrases = [];
  let match;
  while ((match = phraseRegex.exec(content)) !== null) {
    phrases.push({
      english: match[1].trim(),
      spanish: match[2].trim()
    });
  }

  return phrases.map(p =>
    `${p.english}\n\n${p.english}\n\n${p.spanish}\n\n`
  ).join('\n');
}
```

---

### Step 3: Generate Final 22 Audio Files (2 hours)
**Resources:** 38-59

After phrase files are created, run audio generation:

**Command:**
```bash
node scripts/generate-audio-from-phrases.js --batch 38-59
```

**Output:** 22 new MP3 files in `public/audio/`

---

## Priority Order

### 🔴 HIGH Priority (Generate First)
**Safety & Core Functions**
- IDs: 1, 4, 6, 9 (delivery basics)
- IDs: 11, 14, 17 (driver greetings)
- IDs: 12, 15, 19 (navigation)
- IDs: 27, 45-52 (emergencies)

### 🟡 MEDIUM Priority (Generate Second)
**Enhanced Service**
- IDs: 5, 16, 20, 25-26, 31, 33 (customer service)
- IDs: 22-23, 29-30 (numbers, time, safety)
- IDs: 35-44 (advanced business)

### 🟢 LOW Priority (Generate Last)
**Supplemental Content**
- IDs: 3, 8, 24 (visual specs)
- IDs: 53-59 (app-specific advanced)

---

## File Locations Quick Reference

### Existing Audio Files (9)
```
public/audio/
├── resource-2.mp3
├── resource-7.mp3
├── resource-10.mp3
├── resource-13.mp3
├── resource-18.mp3
├── resource-21.mp3
├── resource-28.mp3
├── resource-32.mp3
└── resource-34.mp3
```

### Phrase Files Ready (37)
```
scripts/final-phrases-only/
├── resource-1.txt through resource-37.txt
```

### Source Content for Extraction (22)
```
docs/resources/converted/
├── avanzado/        (IDs 38-44)
├── emergency/       (IDs 45-52)
└── app-specific/    (IDs 53-59)
```

---

## What Each Resource Looks Like

### Example: Ready for Audio (has phrase file)
**Resource ID 1** - Frases Esenciales para Entregas
- **Source:** `generated-resources/50-batch/repartidor/basic_phrases_1.md`
- **Phrases:** `scripts/final-phrases-only/resource-1.txt`
- **Content:** "Hi, I have your delivery\n\nHi, I have your delivery\n\nHola, tengo su entrega\n\n"
- **Action:** Generate audio immediately ✓

### Example: Needs Extraction First
**Resource ID 48** - Medical Emergencies
- **Source:** `docs/resources/converted/emergency/medical-emergencies.md`
- **Phrases:** ❌ Need to create
- **Content Structure:**
  ```markdown
  ### 1. Call 911 immediately!
  **Spanish:** ¡Llame al 911 inmediatamente!
  **Pronunciation:** *YAH-meh al...*
  ```
- **Action:** Extract phrases → Generate audio

---

## Resource Breakdown by Category

### Repartidor (Delivery) - 10 resources
- Basic phrases: 1, 4, 6, 9
- Audio scripts: 2, 7, 10, 32
- Intermediate: 5, 31

### Conductor (Driver) - 15 resources
- Greetings: 11, 14, 17
- Navigation: 12, 15, 19
- Audio scripts: 13, 18, 34
- Small talk: 16, 33
- Problems: 20
- App-specific: 53-55, 59

### All (General) - 34 resources
- Visual specs: 3, 8, 24
- Numbers/Time: 22-23, 29
- Customer service: 25-26
- Emergency: 27, 45-52
- Safety: 30
- Audio scripts: 21, 28
- Advanced: 35-44, 56-58

---

## Expected Results

### After Phase 1 (28 files)
```
Total Audio Files: 37 / 59 (63%)
Remaining: 22 resources
Time Invested: 2-3 hours
```

### After Phase 2 + 3 (22 files)
```
Total Audio Files: 59 / 59 (100%) ✅
Remaining: 0 resources
Total Time: 6-8 hours
Storage Used: ~12-15 MB
```

---

## Success Metrics

✅ **Complete** when:
1. All 59 resources have `audioUrl` in `resources.ts`
2. 50 new MP3 files exist in `public/audio/`
3. All audio follows dual-voice format (EN, EN, ES)
4. Quality spot-check passes
5. Mobile app can play all audio files

---

## Next Steps (In Order)

1. ✅ **Research Complete** (this document)
2. ⏭️ **Generate Batch 1** - Run audio generation for 28 resources
3. ⏭️ **Create Extraction Script** - Build phrase extractor for markdown
4. ⏭️ **Extract Phrases** - Generate 22 phrase files (IDs 38-59)
5. ⏭️ **Generate Batch 2** - Run audio generation for 22 resources
6. ⏭️ **Update resources.ts** - Add audioUrl for all 50 new files
7. ⏭️ **Quality Check** - Listen to samples from each batch
8. ⏭️ **Deploy** - Push to production

---

## Time Estimates

| Task | Duration | Complexity |
|------|----------|------------|
| Generate 28 audio (Phase 1) | 2-3 hours | Low (automated) |
| Create extraction script | 2-3 hours | Medium (new code) |
| Extract 22 phrase files | 30 min | Low (automated) |
| Generate 22 audio (Phase 3) | 2 hours | Low (automated) |
| Quality check & fixes | 1 hour | Low (spot check) |
| Update resources.ts | 15 min | Low (batch edit) |
| **TOTAL** | **6-8 hours** | **Medium** |

---

## Key Files to Know

### Audio Generation Script
```
scripts/generate-audio-from-phrases.js
```
- Takes phrase files from `scripts/final-phrases-only/`
- Uses Azure TTS (Jenny + Dario voices)
- Outputs MP3 to `public/audio/`

### Resources Configuration
```
data/resources.ts
```
- Contains all 59 resource definitions
- Need to add `audioUrl: "/audio/resource-[ID].mp3"` for each

### Phrase Files
```
scripts/final-phrases-only/resource-[1-59].txt
```
- Simple format: English\n\nEnglish\n\nSpanish\n\n
- One phrase per line
- Used directly by audio generation script

---

## Common Issues & Solutions

### Issue: Phrase extraction fails
**Solution:** Manually check markdown format, adjust regex pattern

### Issue: Audio quality problems
**Solution:** Verify SSML formatting, check voice configuration

### Issue: Azure rate limits
**Solution:** Generate in smaller batches, add delays between requests

### Issue: File size too large
**Solution:** Already optimized at 48kbps mono - no action needed

---

## Contact & Support

**Full Research Report:** `docs/AUDIO_GENERATION_RESEARCH_REPORT.md`
**Questions?** Review detailed report for comprehensive information

---

**Ready to Generate Audio! 🎵**
