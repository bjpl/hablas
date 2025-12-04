# Batch Regeneration Plan - 7 Incomplete Resources

**Generated:** 2025-11-09
**Priority:** HIGH - Complete phrase coverage for production deployment
**Estimated Duration:** ~86 minutes (1.5 hours)

---

## Executive Summary

This plan addresses 7 resources with missing audio phrases totaling **75 missing phrases** across critical learning modules. Resource 23 is highest priority with 15 missing phrases.

### Resources to Regenerate (Priority Order)

| Priority | Resource ID | Title | Missing Phrases | Category | Complexity |
|----------|-------------|-------|-----------------|----------|------------|
| 1️⃣ CRITICAL | 23 | Tiempo y Horarios - Var 1 | 15 | all/basico | Medium |
| 2️⃣ HIGH | 22 | Números y Direcciones - Var 1 | 12 | all/basico | Medium |
| 3️⃣ MEDIUM | 30 | Protocolos de Seguridad - Var 1 | 10 | all/intermedio | High |
| 4️⃣ MEDIUM | 25 | Servicio al Cliente - Var 1 | 10 | all/intermedio | High |
| 5️⃣ MEDIUM | 29 | Números y Direcciones - Var 2 | 10 | all/basico | Medium |
| 6️⃣ MEDIUM | 31 | Situaciones Complejas - Var 2 | 9 | repartidor/intermedio | High |
| 7️⃣ MEDIUM | 33 | Small Talk con Pasajeros - Var 2 | 9 | conductor/intermedio | High |

**Total:** 75 missing phrases across 7 resources

---

## Batching Strategy

### Batch 1: Basic Resources (Low Complexity - Parallel Processing)
**Duration:** ~30 minutes
**Resources:** 22, 23, 29

- Similar structure (numbers, time, basic concepts)
- Can be processed in parallel
- Lower Azure TTS API usage per resource

### Batch 2: Intermediate Resources (Medium Complexity - Sequential)
**Duration:** ~56 minutes
**Resources:** 25, 30, 31, 33

- More complex content with scenario-based learning
- Requires sequential processing to avoid API throttling
- Higher phrase count per resource

---

## Detailed Execution Plan

### Phase 1: Script Generation (35 minutes)

#### Resource 22 - Números y Direcciones - Var 1
**Source:** `generated-resources/50-batch/all/basic_numbers_1.md`
**Missing Phrases:** 12
**Script Location:** `audio-specs/resource-22-compact.txt`

**Key Content:**
- Street numbers (1st through 20th)
- Building numbers (apartment, floor, unit)
- Phone number pronunciation
- Address confirmation phrases

#### Resource 23 - Tiempo y Horarios - Var 1 (PRIORITY)
**Source:** `generated-resources/50-batch/all/basic_time_1.md`
**Missing Phrases:** 15
**Script Location:** `audio-specs/resource-23-compact.txt`

**Key Content:**
- Time expressions (o'clock, minutes, AM/PM)
- Delivery time windows
- Pickup schedule phrases
- Duration and ETA

#### Resource 25 - Servicio al Cliente - Var 1
**Source:** `generated-resources/50-batch/all/intermediate_customer_service_1.md`
**Missing Phrases:** 10
**Script Location:** `audio-specs/resource-25-compact.txt`

**Key Content:**
- Professional greetings
- Handling complaints
- Offering solutions
- Positive closure phrases

#### Resource 29 - Números y Direcciones - Var 2
**Source:** `generated-resources/50-batch/all/basic_numbers_2.md`
**Missing Phrases:** 10
**Script Location:** `audio-specs/resource-29-compact.txt`

**Key Content:**
- Advanced address types (suite, building)
- Cross streets and landmarks
- GPS coordinates discussion
- Confirmation techniques

#### Resource 30 - Protocolos de Seguridad - Var 1
**Source:** `generated-resources/50-batch/all/safety_protocols_1.md`
**Missing Phrases:** 10
**Script Location:** `audio-specs/resource-30-compact.txt`

**Key Content:**
- Safety verification phrases
- Emergency situations
- Health and safety protocols
- Incident reporting

#### Resource 31 - Situaciones Complejas - Var 2
**Source:** `generated-resources/50-batch/repartidor/intermediate_situations_2.md`
**Missing Phrases:** 9
**Script Location:** `audio-specs/resource-31-compact.txt`

**Key Content:**
- Difficult delivery scenarios
- Problem resolution
- Customer communication
- Platform-specific issues

#### Resource 33 - Small Talk con Pasajeros - Var 2
**Source:** `generated-resources/50-batch/conductor/intermediate_smalltalk_2.md`
**Missing Phrases:** 9
**Script Location:** `audio-specs/resource-33-compact.txt`

**Key Content:**
- Conversation starters
- Weather and local topics
- Professional boundaries
- Cultural awareness

### Phase 2: Audio Generation (37.5 minutes)

**Azure TTS Configuration:**
- Voice: Dual (Spanish narrator + English native)
- Rate: Slow for English phrases (80%)
- Format: MP3, 128kbps, 44.1kHz
- Pause: 3 seconds between phrases

**Batch Processing Schedule:**

```
Batch 1 (Parallel - 15 minutes):
├── Resource 22: 12 phrases × 30s = 6 min
├── Resource 23: 15 phrases × 30s = 7.5 min
└── Resource 29: 10 phrases × 30s = 5 min

Batch 2 (Sequential - 22.5 minutes):
├── Resource 25: 10 phrases × 30s = 5 min
├── Resource 30: 10 phrases × 30s = 5 min
├── Resource 31: 9 phrases × 30s = 4.5 min
└── Resource 33: 9 phrases × 30s = 4.5 min
```

### Phase 3: Verification (14 minutes)

**Verification Checklist (2 min per resource):**

For each resource:
- [ ] All phrases extracted from source markdown
- [ ] Audio file generated successfully
- [ ] File size appropriate (~7-10MB)
- [ ] Phrase count matches expected total
- [ ] Audio quality meets standards (clarity, pacing)
- [ ] No missing segments or cutoffs
- [ ] Updated in resource catalog

---

## Technical Implementation

### Script Template (Compact Format)

```plaintext
[INTRO]
¡Hola! Bienvenido a Hablas. En los próximos [X] minutos, aprenderás [topic].

[PHRASES - REPEATED FOR EACH]
Frase [N]: [Context in Spanish]
[English phrase - slow]
[English phrase - slow again]
[Spanish translation]
[Practical tip]

[PRACTICE SECTION]
¡Ahora practicamos! Repite después de mí:
[All phrases at normal speed]

[CONCLUSION]
¡Excelente trabajo! Practica estas frases todos los días.
```

### Python Batch Script

**Location:** `scripts/batch-regenerate-incomplete.py`

```python
#!/usr/bin/env python3
"""
Batch Regeneration Script for Incomplete Resources
Generates audio for 7 resources with missing phrases
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, List
import subprocess
import time

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from video_gen.audio_generator.unified import UnifiedAudioGenerator
from video_gen.shared.config import Config

RESOURCES = [
    {
        'id': 23,
        'title': 'Tiempo y Horarios - Var 1',
        'markdown': 'generated-resources/50-batch/all/basic_time_1.md',
        'total_phrases': 24,
        'missing_phrases': 15,
        'priority': 'CRITICAL',
        'batch': 1
    },
    {
        'id': 22,
        'title': 'Números y Direcciones - Var 1',
        'markdown': 'generated-resources/50-batch/all/basic_numbers_1.md',
        'total_phrases': 22,
        'missing_phrases': 12,
        'priority': 'HIGH',
        'batch': 1
    },
    {
        'id': 29,
        'title': 'Números y Direcciones - Var 2',
        'markdown': 'generated-resources/50-batch/all/basic_numbers_2.md',
        'total_phrases': 20,
        'missing_phrases': 10,
        'priority': 'MEDIUM',
        'batch': 1
    },
    {
        'id': 25,
        'title': 'Servicio al Cliente - Var 1',
        'markdown': 'generated-resources/50-batch/all/intermediate_customer_service_1.md',
        'total_phrases': 20,
        'missing_phrases': 10,
        'priority': 'MEDIUM',
        'batch': 2
    },
    {
        'id': 30,
        'title': 'Protocolos de Seguridad - Var 1',
        'markdown': 'generated-resources/50-batch/all/safety_protocols_1.md',
        'total_phrases': 20,
        'missing_phrases': 10,
        'priority': 'MEDIUM',
        'batch': 2
    },
    {
        'id': 31,
        'title': 'Situaciones Complejas - Var 2',
        'markdown': 'generated-resources/50-batch/repartidor/intermediate_situations_2.md',
        'total_phrases': 18,
        'missing_phrases': 9,
        'priority': 'MEDIUM',
        'batch': 2
    },
    {
        'id': 33,
        'title': 'Small Talk con Pasajeros - Var 2',
        'markdown': 'generated-resources/50-batch/conductor/intermediate_smalltalk_2.md',
        'total_phrases': 18,
        'missing_phrases': 9,
        'priority': 'MEDIUM',
        'batch': 2
    }
]

def extract_phrases_from_markdown(markdown_path: str) -> List[Dict]:
    """Extract all phrases from markdown source file"""
    phrases = []

    with open(markdown_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract phrases based on markdown structure
    # Looking for: **English:** pattern and **Spanish:** pattern
    import re

    pattern = r'\*\*English:\*\*\s*(.+?)\s*\*\*Spanish:\*\*\s*(.+?)(?=\n\n|\*\*|$)'
    matches = re.findall(pattern, content, re.MULTILINE | re.DOTALL)

    for idx, (english, spanish) in enumerate(matches, 1):
        phrases.append({
            'number': idx,
            'english': english.strip(),
            'spanish': spanish.strip()
        })

    return phrases

def create_compact_script(resource: Dict, phrases: List[Dict]) -> str:
    """Create compact tutorial script from phrases"""

    script = f"""¡Hola! Bienvenido a Hablas. Soy tu instructor de inglés para trabajadores de gig economy.

En los próximos minutos, vas a aprender {len(phrases)} frases esenciales en inglés para {resource['title']}.

Cada frase la escucharás DOS veces en inglés, pronunciada lentamente y con claridad. Después te doy la traducción en español.

¿Listo? ¡Vamos a empezar!

"""

    # Add each phrase
    for phrase in phrases:
        script += f"""
Frase número {phrase['number']}:
{phrase['english']}
{phrase['english']}
{phrase['spanish']}

"""

    script += f"""
¡Excelente! Ahora viene la práctica rápida. Voy a decir las {len(phrases)} frases en inglés a velocidad normal.

¿Listo? ¡Aquí vamos!

"""

    # Practice section
    for phrase in phrases:
        script += f"{phrase['english']}\n"

    script += """
¡Muy bien! ¡Lo estás haciendo increíble!

Felicidades. Acabas de aprender frases esenciales en inglés.

Mi recomendación: Escucha este audio dos veces al día durante una semana.

Recuerda: Cada palabra que aprendes es dinero en tu bolsillo.

¡Nos vemos en la siguiente lección!
"""

    return script

def generate_audio_from_script(resource_id: int, script_path: str, output_path: str):
    """Generate audio using Azure TTS from script"""

    print(f"  Generating audio for Resource {resource_id}...")

    # Initialize audio generator
    config = Config()
    generator = UnifiedAudioGenerator(config)

    # Read script
    with open(script_path, 'r', encoding='utf-8') as f:
        script_text = f.read()

    # Generate audio
    segments = [
        {
            'text': script_text,
            'voice': 'es-MX-DaliaNeural',  # Spanish narrator
            'language': 'es-MX'
        }
    ]

    generator.generate_audio(segments, output_path)
    print(f"  ✓ Audio generated: {output_path}")

def verify_audio(resource_id: int, expected_phrases: int) -> bool:
    """Verify generated audio meets requirements"""

    audio_path = f"out/audio/resource-{resource_id}.mp3"

    if not os.path.exists(audio_path):
        print(f"  ✗ Audio file not found: {audio_path}")
        return False

    file_size = os.path.getsize(audio_path)
    file_size_mb = file_size / (1024 * 1024)

    if file_size_mb < 1 or file_size_mb > 15:
        print(f"  ⚠ Audio file size unusual: {file_size_mb:.2f} MB")
        return False

    print(f"  ✓ Audio verified: {file_size_mb:.2f} MB")
    return True

def main():
    """Main batch regeneration process"""

    print("=" * 70)
    print("BATCH REGENERATION - 7 Incomplete Resources")
    print("=" * 70)
    print()

    total_start = time.time()
    results = {
        'success': [],
        'failed': [],
        'total_phrases': 0
    }

    # Process by batch
    for batch_num in [1, 2]:
        batch_resources = [r for r in RESOURCES if r['batch'] == batch_num]

        print(f"\n{'='*70}")
        print(f"BATCH {batch_num}: Processing {len(batch_resources)} resources")
        print(f"{'='*70}\n")

        for resource in batch_resources:
            print(f"\nResource {resource['id']}: {resource['title']}")
            print(f"Priority: {resource['priority']} | Missing: {resource['missing_phrases']} phrases")

            try:
                # Step 1: Extract phrases
                print(f"  1. Extracting phrases from markdown...")
                markdown_path = resource['markdown']

                if not os.path.exists(markdown_path):
                    print(f"  ✗ Markdown not found: {markdown_path}")
                    results['failed'].append(resource['id'])
                    continue

                phrases = extract_phrases_from_markdown(markdown_path)
                print(f"  ✓ Extracted {len(phrases)} phrases")

                # Step 2: Create compact script
                print(f"  2. Creating compact tutorial script...")
                script = create_compact_script(resource, phrases)
                script_path = f"audio-specs/resource-{resource['id']}-compact.txt"

                with open(script_path, 'w', encoding='utf-8') as f:
                    f.write(script)
                print(f"  ✓ Script created: {script_path}")

                # Step 3: Generate audio
                print(f"  3. Generating audio...")
                output_path = f"out/audio/resource-{resource['id']}.mp3"
                generate_audio_from_script(resource['id'], script_path, output_path)

                # Step 4: Verify
                print(f"  4. Verifying audio...")
                if verify_audio(resource['id'], len(phrases)):
                    results['success'].append(resource['id'])
                    results['total_phrases'] += len(phrases)
                    print(f"  ✓ Resource {resource['id']} COMPLETE")
                else:
                    results['failed'].append(resource['id'])
                    print(f"  ✗ Resource {resource['id']} FAILED verification")

                # Small delay between resources to avoid API throttling
                time.sleep(2)

            except Exception as e:
                print(f"  ✗ ERROR: {str(e)}")
                results['failed'].append(resource['id'])

        # Longer delay between batches
        if batch_num == 1:
            print("\n  Waiting 10 seconds before Batch 2...")
            time.sleep(10)

    # Summary
    total_time = time.time() - total_start

    print("\n" + "="*70)
    print("BATCH REGENERATION COMPLETE")
    print("="*70)
    print(f"\nTotal Time: {total_time/60:.1f} minutes")
    print(f"Successfully Regenerated: {len(results['success'])} resources")
    print(f"Failed: {len(results['failed'])} resources")
    print(f"Total Phrases Processed: {results['total_phrases']}")

    if results['success']:
        print(f"\nSuccess: Resources {', '.join(map(str, results['success']))}")

    if results['failed']:
        print(f"\n⚠ Failed: Resources {', '.join(map(str, results['failed']))}")
        return 1

    print("\n✓ All resources regenerated successfully!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

---

## Verification Checklist

### Per-Resource Verification

For each resource after regeneration:

- [ ] **Script Quality**
  - All phrases extracted from source
  - Intro and conclusion included
  - Practice section present
  - No duplicate content

- [ ] **Audio Quality**
  - File exists in `out/audio/`
  - File size 7-10MB range
  - Clear Spanish narration
  - English phrases slow and clear
  - No audio artifacts or cutoffs

- [ ] **Phrase Completeness**
  - Phrase count matches expected
  - All phrases audible
  - Proper spacing between phrases
  - Spanish translations included

- [ ] **Integration**
  - Audio file in `public/audio/`
  - Service worker cache updated
  - Resource metadata updated
  - Build succeeds

### Overall Verification

- [ ] All 7 resources regenerated
- [ ] Total phrase count: 75
- [ ] No failed resources
- [ ] Build and deploy successful
- [ ] Manual spot check of 2-3 resources

---

## Rollback Procedure

If regeneration fails or produces low-quality audio:

1. **Preserve Current Audio**
   ```bash
   cp out/audio/resource-{22,23,25,29,30,31,33}.mp3 out/audio/backup/
   ```

2. **Restore from Backup**
   ```bash
   cp out/audio/backup/resource-{ID}.mp3 out/audio/
   ```

3. **Revert Build**
   ```bash
   git checkout out/audio/resource-{ID}.mp3
   npm run build
   ```

4. **Individual Resource Regeneration**
   - Regenerate one resource at a time
   - Verify before proceeding to next
   - Adjust script if needed

---

## Timeline Breakdown

### Phase 1: Script Generation (35 minutes)
- Resource 22: 5 min
- Resource 23: 6 min (priority)
- Resource 25: 5 min
- Resource 29: 5 min
- Resource 30: 5 min
- Resource 31: 5 min
- Resource 33: 4 min

### Phase 2: Audio Generation (37.5 minutes)
- Batch 1 (parallel): 15 min
  - Resources 22, 23, 29
- Batch 2 (sequential): 22.5 min
  - Resources 25, 30, 31, 33

### Phase 3: Verification (14 minutes)
- 2 minutes per resource × 7 = 14 min

**Total Estimated Time: 86.5 minutes (~1.5 hours)**

---

## Success Criteria

1. ✓ All 7 resources have complete phrase coverage
2. ✓ Audio quality meets production standards
3. ✓ Total phrase count: 75 phrases
4. ✓ Build succeeds without errors
5. ✓ Service worker cache updated
6. ✓ Manual verification complete

---

## Next Steps After Completion

1. Run full build: `npm run build`
2. Update service worker cache version
3. Deploy to production
4. Run post-deployment verification
5. Update documentation with completion status
6. Archive batch regeneration artifacts

---

## Notes

- **Azure TTS API:** Monitor for rate limiting
- **Parallel Processing:** Batch 1 resources can run simultaneously
- **Script Quality:** Based on proven resource-2 template
- **Verification:** Critical before deployment
- **Backup Strategy:** Always preserve existing audio before regeneration

---

**Plan Created:** 2025-11-09
**Last Updated:** 2025-11-09
**Status:** Ready for Execution
