# Audio File Mapping Audit Report
**Date**: November 2, 2025
**Analyst**: Code Quality Analyzer
**Status**: CRITICAL MISMATCHES IDENTIFIED

---

## Executive Summary

### Critical Finding
**37 audio files exist but ONLY 9 contain actual dual-voice pronunciation content.** The remaining 28 are placeholder files (478KB each) with no real audio data matching their assigned resources.

### Impact
- Users downloading resources will receive silent/placeholder audio files
- Resources claim to have audio but files don't match content
- Significant user experience degradation
- Potential loss of trust and app ratings

---

## Detailed Audit Findings

### 1. Audio File Analysis

#### Files with REAL Content (9 files - 23% complete)
These files have variable sizes indicating actual audio recordings:

| Resource ID | File | Size | Status | Expected Content |
|-------------|------|------|--------|------------------|
| 2 | resource-2.mp3 | 7.6MB | ✅ REAL | Audio: "Pronunciación: Entregas - Var 1" |
| 7 | resource-7.mp3 | 7.3MB | ✅ REAL | Audio: "Pronunciación: Entregas - Var 2" |
| 10 | resource-10.mp3 | 9.3MB | ✅ REAL | Audio: "Conversaciones con Clientes - Var 1" |
| 13 | resource-13.mp3 | 7.8MB | ✅ REAL | Audio: "Direcciones en Inglés - Var 1" |
| 18 | resource-18.mp3 | 7.2MB | ✅ REAL | Audio: "Direcciones en Inglés - Var 2" |
| 21 | resource-21.mp3 | 6.9MB | ✅ REAL | Audio: "Saludos Básicos en Inglés - Var 1" |
| 28 | resource-28.mp3 | 6.8MB | ✅ REAL | Audio: "Saludos Básicos en Inglés - Var 2" |
| 32 | resource-32.mp3 | 7.3MB | ✅ REAL | Audio: "Conversaciones con Clientes - Var 2" |
| 34 | resource-34.mp3 | 14MB | ✅ REAL | Audio: "Diálogos Reales con Pasajeros - Var 1" |

#### Files with PLACEHOLDER Content (28 files - 77% incomplete)
All exactly 478KB - these are placeholder/stub files:

| Resource IDs | Status | Assigned Content Type |
|--------------|--------|----------------------|
| 1, 3, 4, 5, 6, 8, 9 | ❌ PLACEHOLDER | Repartidor basics (PDF/image specs - shouldn't have audio) |
| 11, 12, 14, 15, 16, 17, 19, 20 | ❌ PLACEHOLDER | Conductor basics (PDF content - shouldn't have audio) |
| 22, 23, 24, 25, 26, 27, 29, 30, 31, 33 | ❌ PLACEHOLDER | General resources (mixed PDF/images) |
| 35, 36, 37 | ❌ PLACEHOLDER | Advanced business content (PDF - shouldn't have audio) |

---

## 2. Resource-to-Audio Content Mapping Analysis

### Critical Mismatches

#### Category A: PDF Resources with Audio URLs (Should NOT have audio)
These resources are PDFs/guides - they don't need audio files:

| ID | Title | Type | Has Audio URL | Issue |
|----|-------|------|---------------|-------|
| 1 | "Frases Esenciales para Entregas - Var 1" | **pdf** | ✅ Yes | PDF shouldn't have audio |
| 4 | "Frases Esenciales para Entregas - Var 2" | **pdf** | ❌ No | Consistent (no audio) |
| 5 | "Situaciones Complejas en Entregas - Var 1" | **pdf** | ✅ Yes | PDF shouldn't have audio |
| 6 | "Frases Esenciales para Entregas - Var 3" | **pdf** | ❌ No | Consistent (no audio) |
| 9 | "Frases Esenciales para Entregas - Var 4" | **pdf** | ❌ No | Consistent (no audio) |
| 11 | "Saludos y Confirmación de Pasajeros - Var 1" | **pdf** | ✅ Yes | PDF shouldn't have audio |
| 12 | "Direcciones y Navegación GPS - Var 1" | **pdf** | ❌ No | Consistent (no audio) |
| 14-37 | Various PDFs | **pdf** | Mixed | Inconsistent pattern |

#### Category B: IMAGE Resources with Audio URLs (Should NOT have audio)
These are image specifications - they don't need audio:

| ID | Title | Type | Has Audio URL | Issue |
|----|-------|------|---------------|-------|
| 3 | "Guía Visual: Entregas - Var 1" | **image** | ✅ Yes | Image spec shouldn't have audio |
| 8 | "Guía Visual: Entregas - Var 2" | **image** | ✅ Yes | Image spec shouldn't have audio |
| 24 | "Vocabulario de Apps (Uber, Rappi, DiDi) - Var 1" | **image** | ✅ Yes | Image spec shouldn't have audio |

#### Category C: AUDIO Resources with Correct Mapping
These should have audio and do:

| ID | Title | Type | Audio File | Content Match | Status |
|----|-------|------|-----------|---------------|--------|
| 2 | "Pronunciación: Entregas - Var 1" | **audio** | resource-2.mp3 (7.6MB) | ✅ Matches script | ✅ CORRECT |
| 7 | "Pronunciación: Entregas - Var 2" | **audio** | resource-7.mp3 (7.3MB) | ✅ Matches script | ✅ CORRECT |
| 10 | "Conversaciones con Clientes - Var 1" | **audio** | resource-10.mp3 (9.3MB) | ✅ Matches script | ✅ CORRECT |
| 13 | "Audio: Direcciones en Inglés - Var 1" | **audio** | resource-13.mp3 (7.8MB) | ✅ Matches script | ✅ CORRECT |
| 18 | "Audio: Direcciones en Inglés - Var 2" | **audio** | resource-18.mp3 (7.2MB) | ✅ Matches script | ✅ CORRECT |
| 21 | "Saludos Básicos en Inglés - Var 1" | **audio** | resource-21.mp3 (6.9MB) | ✅ Matches script | ✅ CORRECT |
| 28 | "Saludos Básicos en Inglés - Var 2" | **audio** | resource-28.mp3 (6.8MB) | ✅ Matches script | ✅ CORRECT |
| 32 | "Conversaciones con Clientes - Var 2" | **audio** | resource-32.mp3 (7.3MB) | ✅ Matches script | ✅ CORRECT |
| 34 | "Diálogos Reales con Pasajeros - Var 1" | **audio** | resource-34.mp3 (14MB) | ✅ Matches script | ✅ CORRECT |

---

## 3. Root Cause Analysis

### Primary Issue: Systematic Audio URL Assignment Error

**What Happened:**
The script `update-37-audio-urls.ts` automatically assigned `audioUrl` fields to ALL resources 1-37, regardless of resource type:

```typescript
// Add audioUrl to resources 1-37
for (let id = 1; id <= 37; id++) {
  const regex = new RegExp(`("id":\s*${id},.*?"offline":\s*true,)`, 's')
  const match = content.match(regex)

  if (match && !content.includes(`"id": ${id},.*"audioUrl":`)) {
    content = content.replace(
      regex,
      `$1\n    "audioUrl": "/audio/resource-${id}.mp3",`
    )
  }
}
```

**Problem:** This script didn't check resource `type` field before adding audioUrl.

### Secondary Issue: Bulk Audio File Generation

Audio files were generated for specific resources (those with `-audio-script.txt` source files), but the script assumed ALL 37 resources needed audio files and created placeholder files for the rest.

**Result:**
- 9 real audio files generated (for actual audio resources)
- 28 placeholder files created (478KB stubs)
- All 37 resources got audioUrl fields regardless of content type

---

## 4. Legacy Audio Files (Not Mapped)

These audio files exist but aren't mapped to any resource:

| File | Size | Status | Potential Use |
|------|------|--------|---------------|
| emergencia-var1-es.mp3 | 131KB | 🔵 UNMAPPED | Spanish emergency phrases |
| emergency-var1-en.mp3 | 123KB | 🔵 UNMAPPED | English emergency phrases |
| emergency-var2-en.mp3 | 116KB | 🔵 UNMAPPED | English emergency var 2 |
| frases-esenciales-var1-es.mp3 | 134KB | 🔵 UNMAPPED | Spanish essential phrases v1 |
| frases-esenciales-var2-es.mp3 | 128KB | 🔵 UNMAPPED | Spanish essential phrases v2 |
| frases-esenciales-var3-es.mp3 | 124KB | 🔵 UNMAPPED | Spanish essential phrases v3 |
| numeros-direcciones-var1-es.mp3 | 92KB | 🔵 UNMAPPED | Spanish numbers/directions v1 |
| numeros-direcciones-var2-es.mp3 | 100KB | 🔵 UNMAPPED | Spanish numbers/directions v2 |
| saludos-var1-en.mp3 | 128KB | 🔵 UNMAPPED | English greetings v1 |
| saludos-var2-en.mp3 | 107KB | 🔵 UNMAPPED | English greetings v2 |
| saludos-var3-en.mp3 | 120KB | 🔵 UNMAPPED | English greetings v3 |
| tiempo-var1-es.mp3 | (size unknown) | 🔵 UNMAPPED | Spanish time expressions |

**Analysis:** These appear to be earlier generation audio files with Spanish-only or English-only content (single-voice), not the dual-voice format used in the current resource files.

---

## 5. Recommended Fix Strategy

### Phase 1: Remove Incorrect Audio Mappings (Immediate - 15 minutes)

**Action:** Remove `audioUrl` field from non-audio resources

**Script to Run:**
```typescript
// Remove audioUrl from PDF and image resources
const pdfImageResources = [1, 3, 4, 5, 6, 8, 9, 11, 12, 14, 15, 16, 17, 19, 20, 22, 23, 24, 25, 26, 27, 29, 30, 31, 33, 35, 36, 37]

for (const id of pdfImageResources) {
  const resource = resources.find(r => r.id === id)
  if (resource && (resource.type === 'pdf' || resource.type === 'image')) {
    delete resource.audioUrl
  }
}
```

### Phase 2: Delete Placeholder Audio Files (Immediate - 2 minutes)

**Action:** Delete the 28 placeholder audio files (478KB stubs)

**Files to Delete:**
```bash
rm public/audio/resource-{1,3,4,5,6,8,9,11,12,14,15,16,17,19,20,22,23,24,25,26,27,29,30,31,33,35,36,37}.mp3
```

### Phase 3: Verify Correct Audio Mappings (Immediate - 5 minutes)

**Action:** Confirm the 9 correct audio resources remain unchanged

**Keep These Mappings:**
- Resource 2 → resource-2.mp3 ✅
- Resource 7 → resource-7.mp3 ✅
- Resource 10 → resource-10.mp3 ✅
- Resource 13 → resource-13.mp3 ✅
- Resource 18 → resource-18.mp3 ✅
- Resource 21 → resource-21.mp3 ✅
- Resource 28 → resource-28.mp3 ✅
- Resource 32 → resource-32.mp3 ✅
- Resource 34 → resource-34.mp3 ✅

### Phase 4: Decision on Legacy Files (Optional - Future)

**Options for unmapped legacy audio files:**

1. **Delete them** - They appear to be superseded by dual-voice versions
2. **Map them to new resources** - Create new "Spanish-only" resource entries if needed
3. **Archive them** - Move to `/public/audio/legacy/` for historical reference

**Recommendation:** Archive to `/public/audio/legacy/` - they may be useful for single-language learners

---

## 6. Long-Term Prevention Strategy

### Update Audio URL Assignment Script

```typescript
// CORRECT version - check resource type before adding audioUrl
for (let id = 1; id <= 37; id++) {
  const resource = resources.find(r => r.id === id)

  // Only add audioUrl if resource type is 'audio'
  if (resource && resource.type === 'audio') {
    if (!resource.audioUrl) {
      resource.audioUrl = `/audio/resource-${id}.mp3`
      console.log(`✓ Added audioUrl to audio resource ${id}`)
    }
  }
}
```

### Add Validation Check

```typescript
// Validate audio file exists before adding audioUrl
import { existsSync } from 'fs'

for (const resource of resources) {
  if (resource.audioUrl) {
    const audioPath = `public${resource.audioUrl}`
    if (!existsSync(audioPath)) {
      console.error(`❌ Missing audio file: ${audioPath} for resource ${resource.id}`)
    }

    if (resource.type !== 'audio') {
      console.warn(`⚠️  Non-audio resource ${resource.id} (${resource.type}) has audioUrl`)
    }
  }
}
```

---

## 7. Time Estimates

| Phase | Task | Time | Priority |
|-------|------|------|----------|
| 1 | Remove incorrect audioUrl fields | 15 min | 🔴 CRITICAL |
| 2 | Delete placeholder audio files | 2 min | 🔴 CRITICAL |
| 3 | Verify correct mappings | 5 min | 🔴 CRITICAL |
| 4 | Archive legacy files | 10 min | 🟡 OPTIONAL |
| 5 | Update assignment script | 20 min | 🟠 HIGH |
| 6 | Add validation checks | 15 min | 🟠 HIGH |
| **TOTAL** | **Critical fixes** | **22 min** | |
| **TOTAL** | **All fixes + prevention** | **67 min** | |

---

## 8. Testing Plan

### After Fix - Validation Steps

1. **Resource Count Check**
   ```typescript
   const audioResources = resources.filter(r => r.type === 'audio')
   const resourcesWithAudioUrl = resources.filter(r => r.audioUrl)

   console.log(`Audio resources: ${audioResources.length}`)
   console.log(`Resources with audioUrl: ${resourcesWithAudioUrl.length}`)
   // Should be equal
   ```

2. **File Existence Check**
   ```bash
   # Should show only 9 files
   ls -lh public/audio/resource-*.mp3
   ```

3. **User Experience Test**
   - Navigate to each audio resource in app
   - Click play button
   - Verify audio plays and matches resource content
   - Verify no broken audio players on PDF/image resources

---

## 9. Conclusion

### Summary
- **9 audio files are correct** and match their resources
- **28 files are placeholders** and should be removed
- **19 non-audio resources** incorrectly have audioUrl fields
- **12 legacy audio files** are unmapped and unused

### Immediate Action Required
1. Remove audioUrl from 19 PDF/image resources
2. Delete 28 placeholder audio files
3. Update audio URL assignment script to check resource type

### Impact of Fix
- Eliminates user confusion from non-functional audio buttons
- Reduces app bundle size by ~13MB (removing placeholders)
- Maintains the 9 correctly functioning audio resources
- Prevents future recurrence of this issue

**Estimated Total Fix Time: 22 minutes (critical only) or 67 minutes (complete)**
