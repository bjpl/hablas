# Audio Quality Standards & Evaluation Criteria
**Hablas Platform - Audio-Resource Alignment Standards**
**Created**: November 2, 2025
**Purpose**: Define clear, measurable standards for audio quality and content matching

---

## 🎯 Core Principles

### 1. Content Fidelity
**Principle**: Audio must accurately represent the resource's educational content
**Rationale**: Users expect audio to teach what the page describes

### 2. Language Integrity
**Principle**: Each language must be spoken by native speakers of that language
**Rationale**: Pronunciation modeling requires authentic native speech

### 3. Learner Focus
**Principle**: Audio contains only learner-facing content, no production metadata
**Rationale**: Technical notes distract from learning and confuse students

### 4. Accessibility
**Principle**: Audio complements (not replaces) written content
**Rationale**: Multi-modal learning serves diverse learning styles

---

## 📋 Evaluation Standards

### Category A: Content Matching (CRITICAL)

#### A1. Topic Alignment ✅ REQUIRED
**Standard**: Audio topic must match resource title and description

**Evaluation**:
- ✅ **PASS**: Audio teaches phrases about the resource's stated topic
- ⚠️ **WARN**: Audio includes relevant content plus some generic phrases
- ❌ **FAIL**: Audio teaches different topic than resource describes

**Examples**:
- ✅ Resource "Conversaciones Con Clientes - Var 2" → Audio has customer conversation phrases
- ❌ Resource "Emergency Procedures" → Audio has generic delivery greetings

**Test Method**:
1. Read resource title and description
2. Listen to first 30 seconds of audio
3. Verify content matches stated topic

---

#### A2. Phrase Accuracy ✅ REQUIRED
**Standard**: Phrases in audio must come from the resource's source content

**Evaluation**:
- ✅ **PASS**: 80%+ of audio phrases match phrases in source file
- ⚠️ **WARN**: 50-80% match (some generic filler)
- ❌ **FAIL**: <50% match (mostly different content)

**Test Method**:
1. Read source file (markdown or JSON)
2. Extract key phrases from source
3. Listen to audio and compare phrases
4. Calculate match percentage

**Acceptable Additions**:
- Instructor narration/introduction
- Pronunciation guidance
- Usage tips and context
- Practice drills using the phrases

**NOT Acceptable**:
- Completely different phrases
- Generic content when specific expected
- Wrong scenario/situation

---

#### A3. Completeness ✅ REQUIRED
**Standard**: Audio covers the most important content from the resource

**Evaluation**:
- ✅ **PASS**: Includes 15-20 key phrases or all critical vocabulary
- ⚠️ **WARN**: Includes 10-14 phrases (adequate but could be better)
- ❌ **FAIL**: <10 phrases or misses critical content

**Test Method**:
1. Count distinct phrases/vocabulary in source
2. Count distinct phrases in audio
3. Verify coverage of "critical" terms (for safety/emergency resources)

---

### Category B: Language & Voice Assignment (CRITICAL)

#### B1. Language Detection ✅ REQUIRED
**Standard**: Script correctly identifies which phrases are English vs Spanish

**Evaluation**:
- ✅ **PASS**: 100% correct language detection
- ⚠️ **WARN**: 95-99% correct (1-2 errors out of 40+ phrases)
- ❌ **FAIL**: <95% correct

**Test Method**:
1. Read phrase script
2. For each line, manually determine language
3. Check if generation log shows correct EN: or SP: prefix
4. Calculate accuracy

**Common Failures**:
- English without obvious indicators ("Hello, how are you") → defaults wrong
- Mixed language phrases
- Names or proper nouns

---

#### B2. Voice-Language Match ✅ REQUIRED
**Standard**: English phrases use English voices, Spanish phrases use Spanish voices

**Evaluation**:
- ✅ **PASS**: 100% correct voice assignment
- ❌ **FAIL**: Any English in Spanish voice or vice versa

**Test Method**:
1. Listen to audio
2. Identify when voice changes
3. Verify each phrase uses appropriate language voice
4. Check generation logs for EN:/SP: assignment

**Voices to Verify**:
- English: en-US-JennyNeural (female), en-US-GuyNeural (male)
- Spanish: es-CO-SalomeNeural, es-CO-GonzaloNeural (Colombian), es-MX-DaliaNeural, es-MX-JorgeNeural (Mexican)

---

#### B3. Bilingual Balance ⚠️ RECOMMENDED
**Standard**: Each English phrase should have corresponding Spanish translation

**Evaluation**:
- ✅ **EXCELLENT**: 1:1 ratio (each English phrase has Spanish)
- ⚠️ **ACCEPTABLE**: 2:1 ratio (English repeated for learning, then Spanish)
- ⚠️ **WARN**: 3:1 or higher (missing translations)

**Test Method**:
1. Count English lines in script
2. Count Spanish lines in script
3. Calculate ratio
4. Verify pattern: EN, EN (repeat), SP

**Note**: Some instructor narration may be Spanish-only (introductions, tips) - this is acceptable.

---

### Category C: Production Quality (IMPORTANT)

#### C1. No Technical Metadata ✅ REQUIRED
**Standard**: Audio contains zero production notes, voice casting instructions, or technical specifications

**Forbidden Content**:
- ❌ "PRODUCTION NOTES"
- ❌ "Voice Casting:", "Audio Quality:", "File Specifications:"
- ❌ "[Tone: ...]", "[Speaker: ...]", "[Phonetic: ...]", "[PAUSE: ...]"
- ❌ "## COMPANION PDF", "**END OF AUDIO SCRIPT**"
- ❌ Technical timestamps like "[00:45]", "[END: 09:15]"

**Acceptable Content**:
- ✅ Instructor narration ("Hola, bienvenido a Hablas...")
- ✅ Teaching explanations ("Esta frase se usa cuando...")
- ✅ Practice drills ("Ahora vamos a practicar...")
- ✅ Motivational conclusions ("¡Felicidades! Acabas de aprender...")

**Test Method**:
1. Listen to entire audio file
2. Note if you hear any production terminology
3. Check script for forbidden markers
4. Verify students would understand all content

---

#### C2. Audio File Size ⚠️ RECOMMENDED
**Standard**: Files optimized for mobile data usage

**Target Sizes**:
- ✅ **EXCELLENT**: 500 KB - 3 MB (quick phrases/vocabulary)
- ⚠️ **ACCEPTABLE**: 3-10 MB (longer lessons with narration)
- ⚠️ **WARN**: 10-20 MB (consider compression or splitting)
- ❌ **EXCESSIVE**: >20 MB (too large for mobile data)

**Test Method**:
1. Check file size
2. Calculate: size / expected_phrases
3. Verify reasonable ~100-300 KB per phrase including narration

---

#### C3. Dual-Voice Format ✅ REQUIRED
**Standard**: Audio uses alternating voices for language reinforcement

**Expected Pattern**:
```
English phrase (English voice)
English phrase repeated (English voice)
Spanish translation (Spanish voice)
[pause]
```

**Evaluation**:
- ✅ **PASS**: Consistent EN-EN-SP pattern throughout
- ⚠️ **WARN**: Mostly consistent with minor variations
- ❌ **FAIL**: No pattern or single voice throughout

---

### Category D: User Experience (IMPORTANT)

#### D1. Resource Page Integration ✅ REQUIRED
**Standard**: Audio player displays correctly on resource pages

**Checks**:
- ✅ AudioPlayer component renders (not stuck on "Cargando")
- ✅ Play button functional
- ✅ Progress bar works
- ✅ Download option available
- ✅ No console errors

**Test Method**:
1. Navigate to resource detail page
2. Verify audio player appears within 2 seconds
3. Click play and verify audio plays
4. Check browser console for errors

---

#### D2. Audio Accessibility ✅ REQUIRED
**Standard**: Audio files accessible via correct paths

**Checks**:
- ✅ File exists at URL specified in resources.ts
- ✅ HTTP 200 response (not 404)
- ✅ Correct MIME type (audio/mpeg)
- ✅ File not corrupted (can be downloaded and played)

**Test Method**:
```bash
curl -I https://bjpl.github.io/hablas/audio/resource-{id}.mp3
# Should show: HTTP 200 OK, Content-Type: audio/mpeg
```

---

#### D3. Offline Functionality ⚠️ RECOMMENDED
**Standard**: Audio can be downloaded and cached for offline use

**Checks**:
- ⚠️ Service Worker caches audio files
- ⚠️ Download button works
- ⚠️ Audio plays when offline
- ⚠️ Progress persists across sessions

**Test Method**:
1. Download audio file
2. Disconnect network
3. Verify audio still plays
4. Check localStorage for cached data

---

## 🔍 Audit Process

### Phase 1: Automated Checks (10 minutes)
Run scripts to verify:
- All audio files exist
- File sizes reasonable
- No duplicate MD5 hashes (except intentional)
- audioUrl fields match existing files

### Phase 2: Content Sampling (30 minutes)
Manually verify 10-15 resources:
- Resource title → Audio topic match
- Source phrases → Audio phrases match
- English voice → English phrases
- Spanish voice → Spanish phrases

### Phase 3: Production Note Scan (15 minutes)
Search audio scripts for:
- "PRODUCTION", "Voice Casting", "[Tone:", "[Speaker:"
- Technical timestamps, file specs
- Any non-learner-facing content

### Phase 4: User Experience Test (20 minutes)
Browser testing:
- Audio player loads on 5-10 pages
- Play functionality works
- No console errors
- Download works

---

## ✅ Pass/Fail Criteria

### Required for Production (MUST PASS):
- ✅ A1: Topic Alignment
- ✅ A2: Phrase Accuracy (≥80%)
- ✅ B1: Language Detection (≥95%)
- ✅ B2: Voice-Language Match (100%)
- ✅ C1: No Technical Metadata
- ✅ D1: Resource Page Integration
- ✅ D2: Audio Accessibility

### Recommended for Excellence (SHOULD PASS):
- ⚠️ A3: Completeness (15+ phrases)
- ⚠️ B3: Bilingual Balance (2:1 or better)
- ⚠️ C2: File Size (<10 MB)
- ⚠️ C3: Dual-Voice Format
- ⚠️ D3: Offline Functionality

---

## 📊 Scoring System

### Overall Quality Score Calculation:

**Category Weights**:
- Content Matching (A): 40%
- Language & Voice (B): 35%
- Production Quality (C): 15%
- User Experience (D): 10%

**Score per Category**:
- PASS = 100 points
- WARN = 70 points
- FAIL = 0 points

**Overall Grade**:
- 90-100: ✅ **EXCELLENT** (Production Ready)
- 80-89: ✅ **GOOD** (Minor improvements needed)
- 70-79: ⚠️ **ACCEPTABLE** (Some issues to fix)
- 60-69: ⚠️ **NEEDS WORK** (Multiple issues)
- <60: ❌ **NOT READY** (Major problems)

---

## 📝 Sample Audit Report Format

```
Resource ID: 32
Title: "Conversaciones Con Clientes - Var 2"
Category: Repartidor, Intermedio

CONTENT MATCHING:
  A1. Topic Alignment: ✅ PASS (customer conversations as stated)
  A2. Phrase Accuracy: ✅ PASS (90% match to source)
  A3. Completeness: ✅ PASS (20 key phrases)
  Score: 100/100

LANGUAGE & VOICE:
  B1. Language Detection: ✅ PASS (100% correct)
  B2. Voice-Language Match: ✅ PASS (verified)
  B3. Bilingual Balance: ✅ EXCELLENT (1:1 ratio)
  Score: 100/100

PRODUCTION QUALITY:
  C1. No Technical Metadata: ✅ PASS (clean audio)
  C2. File Size: ✅ EXCELLENT (1.1 MB)
  C3. Dual-Voice Format: ✅ PASS (consistent)
  Score: 100/100

USER EXPERIENCE:
  D1. Page Integration: ✅ PASS (player loads, works)
  D2. Accessibility: ✅ PASS (HTTP 200, playable)
  D3. Offline: ⚠️ NOT TESTED
  Score: 90/100

OVERALL SCORE: 98/100 ✅ EXCELLENT
RECOMMENDATION: APPROVED FOR PRODUCTION
```

---

## 🚀 Application to Current Audit

### Known Issues to Verify:
1. **Resource 32**: User reported mismatch (NOW FIXED - needs verification)
2. **Resources 2,7,10,13,18,21,28,34**: Production notes removed (needs verification)
3. **Visual guides (3,8,24)**: Archived (needs confirmation not showing)
4. **All 56 resources**: Need spot-check for content matching

### Audit Priority Order:
1. **HIGH**: Resources user specifically mentioned (32)
2. **HIGH**: Narration resources (2,7,10,13,18,21,28,34)
3. **MEDIUM**: Emergency resources (45-52) - safety critical
4. **MEDIUM**: App-specific (53-59) - platform vocabulary
5. **LOW**: Basic delivery/driver (1,4-6,9,11-12,14-17,19-20,22-27,29-31,33,35-37)
6. **LOW**: Advanced business (38-44)

### Success Criteria for Full Platform:
- ✅ 95% of resources score ≥80 (Good or better)
- ✅ 0 resources score <60 (Not Ready)
- ✅ All user-reported issues verified fixed
- ✅ No production notes in any audio
- ✅ All English in English voices, all Spanish in Spanish voices

---

## 📊 Audit Deliverables

### 1. Comprehensive Audit Report
For ALL 56 resources:
- Individual scores per resource
- Category breakdown (A, B, C, D)
- Overall quality score
- Pass/Fail status
- Issues found with specific examples

### 2. Priority Fix List
Resources failing any CRITICAL standard:
- Specific issue description
- Root cause analysis
- Fix recommendation
- Estimated time to fix

### 3. Verification Checklist
For each fixed resource:
- [ ] Re-audited against standards
- [ ] Score improved to ≥80
- [ ] User-facing content only
- [ ] Correct voice assignment verified
- [ ] Browser tested

### 4. Final Quality Report
Summary metrics:
- % resources EXCELLENT (90-100)
- % resources GOOD (80-89)
- % resources ACCEPTABLE (70-79)
- % resources NEEDS WORK (60-69)
- % resources NOT READY (<60)
- Overall platform quality score

---

## 🎯 Quality Gates

### Before Audio Generation:
- [ ] Source file exists and is readable
- [ ] Phrases extracted match source content
- [ ] Script has both English and Spanish
- [ ] No production notes in script
- [ ] Language detection tested on sample phrases

### After Audio Generation:
- [ ] File generated successfully (no errors)
- [ ] File size reasonable for content length
- [ ] Generation log shows correct EN:/SP: assignments
- [ ] No production note text in generated audio
- [ ] Sample listen confirms dual-voice format

### Before Deployment:
- [ ] All 56 files exist in public/audio/
- [ ] Build succeeds with no errors
- [ ] Spot-check 10 resources confirms quality
- [ ] Browser test confirms player works
- [ ] No 404 errors on audio files

---

## 🔧 Remediation Standards

### Minor Issues (Can Deploy):
- File size 10-15 MB (optimize later)
- 1-2 language detection errors out of 50+ phrases
- Missing 1-2 non-critical phrases
- Bilingual ratio 3:1 (acceptable for phrase-only resources)

### Major Issues (Must Fix Before Deploy):
- Wrong topic content
- <50% phrase accuracy
- English in Spanish voice (or vice versa)
- Production notes audible
- Audio player doesn't load
- 404 errors on audio files

### Critical Issues (Stop Everything):
- Safety/emergency vocabulary incorrect or missing
- Systematic voice assignment failures across multiple resources
- Build failures
- Mass 404 errors
- Audio player completely broken

---

## 📈 Continuous Improvement

### Post-Deployment Monitoring:
- User feedback on audio accuracy
- Analytics: audio play rates
- Error logs: failed audio loads
- Download metrics

### Iteration Cycle:
1. Collect user feedback (weekly)
2. Prioritize reported issues
3. Fix top 3-5 issues
4. Re-audit affected resources
5. Deploy improvements (bi-weekly)

---

## ✅ Success Definition

**Platform is PRODUCTION READY when**:
- ✅ All 56 resources score ≥80 (Good or better)
- ✅ Zero resources with wrong topic audio
- ✅ Zero production notes in any audio
- ✅ 100% correct voice-language assignment
- ✅ Audio player works on all resource pages
- ✅ User can download and play offline
- ✅ Overall platform score ≥85

**Platform is EXCELLENT when**:
- ✅ 80%+ resources score ≥90 (Excellent)
- ✅ All phrases match source content
- ✅ All emergency resources score 95+
- ✅ File sizes optimized (<5 MB average)
- ✅ Overall platform score ≥90

---

---

## 📝 Text Formatting Standards

### Category E: Script Formatting (IMPORTANT)

#### E1. Consistent Structure ✅ REQUIRED
**Standard**: All phrase scripts follow identical format pattern

**Required Format**:
```
English phrase

English phrase

Spanish translation


[repeat for each phrase]
```

**Rules**:
- Each English phrase on own line
- English repeated exactly (line 1 = line 2)
- Spanish translation follows (1 line)
- 2 blank lines after Spanish (separator)
- No extra blank lines within phrases

**Evaluation**:
- ✅ **PASS**: 100% consistent format throughout
- ⚠️ **WARN**: 90-99% consistent (1-2 formatting errors)
- ❌ **FAIL**: <90% consistent (multiple format violations)

---

#### E2. Punctuation & Capitalization ✅ REQUIRED
**Standard**: Professional, consistent punctuation and capitalization

**English Phrases**:
- ✅ Capitalize first word
- ✅ Capitalize proper nouns (Chipotle, Michael, Uber)
- ✅ Use proper punctuation (periods, question marks, exclamation points)
- ✅ No excessive punctuation (!!!, ???)

**Spanish Phrases**:
- ✅ Capitalize first word
- ✅ Use inverted question marks: ¿...?
- ✅ Use inverted exclamation marks: ¡...!
- ✅ Proper accent marks: á, é, í, ó, ú, ñ
- ✅ Capitalize proper nouns (DoorDash, María)

**Common Errors to Avoid**:
- ❌ Missing question marks: "Are you Sarah" → "Are you Sarah?"
- ❌ Missing inverted marks: "Es usted María?" → "¿Es usted María?"
- ❌ Inconsistent capitalization: "here's your order" → "Here's your order"
- ❌ Missing periods at end of statements

---

#### E3. Character Encoding ✅ REQUIRED
**Standard**: Proper UTF-8 encoding for all special characters

**Spanish Special Characters** (must render correctly):
- á, é, í, ó, ú (accented vowels)
- ñ (eñe)
- ü (u with dieresis)
- ¿ (inverted question mark)
- ¡ (inverted exclamation)

**Test Method**:
```bash
# Check file encoding
file -i scripts/final-phrases-only/resource-*.txt
# Should show: charset=utf-8

# Verify special characters
grep -r "¿\|¡\|ñ\|á\|é" scripts/final-phrases-only/
```

**Evaluation**:
- ✅ **PASS**: All special characters render correctly
- ❌ **FAIL**: Any mojibake or missing characters

---

#### E4. Line Endings ⚠️ RECOMMENDED
**Standard**: Consistent line endings (LF or CRLF)

**Recommendation**: LF (Unix-style) for cross-platform compatibility

**Test Method**:
```bash
dos2unix -i scripts/final-phrases-only/*.txt
```

**Note**: This is non-critical for audio generation but improves git diffs.

---

#### E5. Whitespace Consistency ⚠️ RECOMMENDED
**Standard**: No trailing whitespace, consistent blank line usage

**Rules**:
- No trailing spaces at end of lines
- Exactly 2 blank lines between phrases
- No blank lines at start or end of file
- No tabs (use spaces if indentation needed)

**Test Method**:
```bash
# Find trailing whitespace
grep -n " $" scripts/final-phrases-only/*.txt

# Find files with wrong blank line count
awk 'BEGIN{blanks=0} /^$/{blanks++} /[^ ]/{if(blanks>2)print FILENAME":"NR-blanks; blanks=0}' scripts/final-phrases-only/*.txt
```

---

#### E6. Phrase Length ⚠️ RECOMMENDED
**Standard**: Phrases should be concise and speakable (3-15 words optimal)

**Guidelines**:
- ✅ **OPTIMAL**: 3-10 words (easy to remember)
- ⚠️ **ACCEPTABLE**: 10-15 words (can still learn)
- ⚠️ **WARN**: 15-25 words (too long, consider splitting)
- ❌ **EXCESSIVE**: >25 words (definitely split)

**Exceptions**:
- Full dialogues or scenarios (acceptable if marked as such)
- Instructor narration (context-setting)
- Multi-part instructions

**Test Method**:
```python
for line in phrases:
    word_count = len(line.split())
    if word_count > 25:
        print(f"WARNING: Line too long ({word_count} words)")
```

---

#### E7. Translation Completeness ✅ REQUIRED
**Standard**: Spanish translations must be complete sentences (not truncated)

**Common Issues**:
- ❌ "Tengo problemas para encontrar tu" (incomplete)
- ✅ "Tengo problemas para encontrar tu dirección" (complete)

- ❌ "¿Puede verificar este pedido dos veces?" (missing context)
- ✅ "¿Puede verificar este pedido dos veces? El cliente pidió artículos adicionales." (complete with context)

**Test Method**:
1. Read each Spanish line
2. Verify it ends with punctuation (. ! ?)
3. Verify sentence makes sense standalone
4. Compare to English version - should be equivalent meaning

**Evaluation**:
- ✅ **PASS**: All Spanish sentences complete and meaningful
- ⚠️ **WARN**: 90-95% complete (1-2 truncations)
- ❌ **FAIL**: <90% complete (multiple truncated sentences)

---

#### E8. Consistency Across Variants ⚠️ RECOMMENDED
**Standard**: Similar resources should have similar formatting

**Example**:
- "Frases Esenciales - Var 1"
- "Frases Esenciales - Var 2"
- "Frases Esenciales - Var 3"

These should have:
- Same number of phrases (±2)
- Same format pattern
- Similar phrase types
- Comparable file sizes

**Not Required**: Identical content (variants should have different phrases)

---

### Category F: Content Quality (IMPORTANT)

#### F1. Cultural Appropriateness ✅ REQUIRED
**Standard**: Content appropriate for Colombian gig workers in US

**Checks**:
- ✅ Uses "usted" (formal) for customers, "tú" for peers when appropriate
- ✅ Mentions relevant US contexts (tips, ratings, 911, etc.)
- ✅ Acknowledges Colombian background without stereotyping
- ✅ Professional, respectful tone

**Evaluation**:
- ✅ **PASS**: Culturally sensitive and appropriate
- ❌ **FAIL**: Insensitive, stereotypical, or inappropriate

---

#### F2. Practical Utility ✅ REQUIRED
**Standard**: Phrases are genuinely useful in real gig work scenarios

**Checks**:
- ✅ Phrases workers will actually use daily
- ✅ Scenarios reflect real delivery/rideshare situations
- ✅ Vocabulary matches platform terminology (Dasher, Peak Pay, etc.)
- ✅ Safety-critical phrases for emergencies

**Examples**:
- ✅ "Hi, I have your delivery" (used constantly)
- ✅ "What's the gate code?" (common problem)
- ⚠️ "The weather is nice today" (less practical)
- ❌ "I enjoy classical music" (not relevant)

---

#### F3. Difficulty Appropriateness ⚠️ RECOMMENDED
**Standard**: Content matches stated level (básico, intermedio, avanzado)

**Básico Expectations**:
- Simple present tense
- Common vocabulary
- Short phrases (3-8 words)
- High-frequency scenarios

**Intermedio Expectations**:
- Mix of tenses
- Industry-specific vocabulary
- Longer phrases (8-15 words)
- Problem-solving scenarios

**Avanzado Expectations**:
- Complex grammar
- Professional/business vocabulary
- Full dialogues
- Nuanced situations

---

#### F4. Pronunciation Clarity ⚠️ RECOMMENDED
**Standard**: Audio should model clear, learnable pronunciation

**For English**:
- Slight reduction in speed (-20%) for clarity
- Clear enunciation
- American accent (en-US voices)

**For Spanish**:
- Natural conversational pace
- Colombian or Mexican accent (matches target learners)
- Clear distinction of similar sounds

**Note**: TTS quality depends on edge-tts capabilities - this is aspirational.

---

## 📊 Complete Scoring Matrix

### Required Standards (Must Pass All):
| ID | Standard | Weight | Pass Threshold |
|----|----------|--------|----------------|
| A1 | Topic Alignment | 15% | Match stated topic |
| A2 | Phrase Accuracy | 20% | ≥80% match to source |
| B1 | Language Detection | 15% | ≥95% accuracy |
| B2 | Voice-Language Match | 20% | 100% correct |
| C1 | No Tech Metadata | 10% | Zero production notes |
| D1 | Page Integration | 5% | Player loads & works |
| D2 | Accessibility | 5% | HTTP 200, playable |
| E1 | Format Structure | 5% | Consistent format |
| E7 | Translation Complete | 5% | No truncation |

**TOTAL**: 100%

**Minimum Production Score**: 80/100 (all CRITICAL standards must pass)

---

## 🎯 Audit Application Plan

### Phase 1: Automated Checks (Quick)
Run scripts to verify:
- ✅ E1: Format consistency
- ✅ E2: Punctuation patterns
- ✅ E3: UTF-8 encoding
- ✅ E7: Translation completeness
- ✅ D2: File accessibility

### Phase 2: Sample Review (Thorough)
Manually check 15 resources:
- 5 HIGH priority (32, 2, 7, 45, 52)
- 5 MEDIUM priority (random selection)
- 5 LOW priority (random selection)

For each:
- ✅ A1, A2: Content matching
- ✅ B1, B2: Voice assignment
- ✅ C1: No production notes
- ✅ D1: Player works

### Phase 3: Spot Listening (Verification)
Listen to 30 seconds of each sampled resource:
- Verify dual-voice format
- Confirm correct languages
- Check for production notes
- Assess overall quality

---

**These comprehensive standards ensure systematic, objective quality evaluation.**

**Ready to run full audit against these standards?** 📋
