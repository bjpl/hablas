# Adaptive Audio Format System

## Overview

The audio generation system now automatically detects resource types and applies appropriate audio formatting for optimal learning. Different types of content require different pacing, repetition patterns, and instructional approaches.

## Resource Types

### 1. Basic Phrases (Default)
**Detection**: Default for most resources
**Use Case**: Learning essential phrases for daily work

**Format**:
- Context in Spanish
- English phrase (slow, -20%)
- Pause 1 second
- English phrase repeated (slow, -20%)
- Pause 1 second
- Spanish translation
- Pause 2.5 seconds (learner repetition)

**Introduction**:
> "¡Hola! Bienvenido a Hablas. En los próximos minutos vas a aprender X frases esenciales en inglés..."

**Practice**: All phrases at normal speed with 2.5s pauses

**Conclusion**:
> "Practica dos veces al día: por la mañana y por la noche. Cada palabra que aprendes es dinero en tu bolsillo."

---

### 2. Conversation Format
**Detection**: Keywords in title/filename:
- "conversation", "conversaciones"
- "smalltalk", "small talk"
- "dialogue", "diálogo", "diálogos"

**Use Case**: Learning back-and-forth dialogue skills
**Resources**: 10, 31, 32, 15, 34

**Format**:
- "Intercambio X" (Exchange X)
- English phrase (slow, -20%)
- Pause 1 second
- English repeated (slow, -20%)
- Pause 1 second
- Spanish translation
- **Pause 3 seconds** (longer for formulating response)
- Pause 2 seconds between exchanges

**Introduction**:
> "En esta lección practicarás X intercambios conversacionales. Imagina cada situación, escucha la conversación en inglés y español. Tendrás tiempo para formular tu respuesta después de cada intercambio."

**Practice**: Full exchanges at normal speed with 3-second thinking pauses

**Conclusion**:
> "Escucha esta lección varias veces hasta que las respuestas salgan naturalmente. Cada conversación exitosa aumenta tus propinas."

---

### 3. Directions Format
**Detection**: Keywords in title/filename:
- "direction", "direcciones"
- "navigation", "navegación"
- "gps", "números"

**Use Case**: Quick reference while navigating
**Resources**: 12, 13, 19, 22, 23

**Format** (Rapid Reference):
- "Frase X"
- English phrase (slow, -20%)
- Pause 0.8 seconds (quicker)
- **NO REPEAT** (single English playback for speed)
- Spanish translation
- Pause 2 seconds
- Pause 1 second between phrases (fast-paced)

**Introduction**:
> "Esta es una guía rápida con X frases de navegación y direcciones. Escucha cada frase en inglés y español. Ideal para consulta rápida mientras trabajas."

**Practice**: Rapid-fire all English phrases at +10% speed with 1.5s pauses

**Conclusion**:
> "Regresa a esta lección cuando necesites una consulta rápida. Conocer direcciones te hace más eficiente y ganas más."

---

### 4. Emergency Format
**Detection**: Keywords in title/filename:
- "emergency", "emergencia"
- "safety", "seguridad"
- "protocolo", "accident"

**Use Case**: Critical safety phrases that must be internalized
**Resources**: 27, 28

**Format** (Slow & Clear):
- "Frase de emergencia X"
- English phrase (**extra slow, -30%**)
- Pause 1.5 seconds (longer for processing)
- English repeated (**extra slow, -30%**)
- Pause 1.5 seconds
- Spanish translation
- **Pause 3.5 seconds** (extra time to internalize)
- Pause 2 seconds between phrases

**Introduction** (Serious Tone):
> "¡Atención! Esta es una lección importante de seguridad. Aprenderás X frases de emergencia que pueden salvar vidas. Escucha con cuidado cada frase, despacio y claramente. Estas frases son fundamentales para tu seguridad y la de otros. Pon atención completa."

**Practice**: Standard with 3.5s pauses (clear repetition emphasis)

**Conclusion** (Safety Emphasis):
> "Repasa esta lección regularmente. Nunca se sabe cuándo las necesitarás. Tu seguridad y la de otros depende de que recuerdes estas frases. Números de emergencia: nueve uno uno, nine one one. Mantente seguro."

---

## Pause Configuration Summary

| Type | After EN1 | After EN2 | After ES | Between | Section |
|------|-----------|-----------|----------|---------|---------|
| **Basic** | 1000ms | 1000ms | 2500ms | 1500ms | 2000ms |
| **Conversation** | 1000ms | 1000ms | **3000ms** | **2000ms** | 2500ms |
| **Directions** | **800ms** | **800ms** | 2000ms | **1000ms** | **1500ms** |
| **Emergency** | **1500ms** | **1500ms** | **3500ms** | 2000ms | 2500ms |

## English Playback Speed

| Type | First Play | Repeat | Practice |
|------|-----------|---------|----------|
| **Basic** | -20% | -20% | +0% |
| **Conversation** | -20% | -20% | +0% |
| **Directions** | -20% | **SKIP** | **+10%** |
| **Emergency** | **-30%** | **-30%** | +0% |

## Implementation

### Type Detection
```python
def detect_resource_type(resource_id: str, title: str) -> str:
    """Auto-detect resource type from title/filename."""
    # Checks title and source filename for keywords
    # Returns: 'conversation', 'directions', 'emergency', or 'basic_phrases'
```

### Title Extraction
```python
def get_resource_title(resource_id: str, mapping: Dict) -> str:
    """Get title from mapping or analyze source filename."""
    # Falls back to filename analysis if title not in mapping
```

### Format Application
```python
async def generate_complete_audio(resource_id: str, phrases: List,
                                 resource_type: str) -> bool:
    """Generate audio with type-specific formatting."""
    # Uses PAUSE_CONFIGS[resource_type] for all timing
    # Calls type-aware intro/practice/conclusion functions
```

## Testing

### Run Full Test Suite
```bash
# Test all 4 types (Resources 1, 10, 12, 27)
./scripts/test-one-each-type.sh
```

### Manual Single Resource
```bash
# Test specific resource with auto-detection
python3 scripts/regenerate-from-source-complete.py
# Follow prompts or modify script to target specific resource
```

### Verify Type Detection
```bash
# Check type detection without generating audio
python3 scripts/test-type-detection.py
```

## Log Output Example

```
============================================================
🔄 Processing Resource 10
============================================================
  📋 Title/Type hint: Conversaciones
  🎯 Detected format: conversation
  📄 Source: intermediate_conversations_1-audio-script.txt
  ✓ Extracted 8 phrase pairs
  🎤 Generating introduction...
  🎤 Generating 8 phrases...
  🎤 Generating practice section...
  🎤 Generating conclusion...
  🔧 Concatenating 87 audio segments...
  ✅ Generated: resource-10.mp3 (4.23 MB)
  ✅ Resource 10 COMPLETE
```

## Files Modified

1. **scripts/regenerate-from-source-complete.py**
   - Added `PAUSE_CONFIGS` dictionary
   - Added `detect_resource_type()` function
   - Added `get_resource_title()` function
   - Updated all audio generation functions to accept `resource_type`
   - Type-specific intro/practice/conclusion text

2. **scripts/test-type-detection.py** (NEW)
   - Standalone type detection test
   - Shows distribution across all resources

3. **scripts/test-one-each-type.sh** (NEW)
   - Integration test for all 4 formats
   - Tests Resources 1, 10, 12, 27

## Benefits

### For Learners
- **Conversations**: More thinking time for formulating responses
- **Directions**: Faster reference, less repetition
- **Emergency**: Extra clarity and emphasis on critical phrases
- **Basic**: Balanced approach for general learning

### For Content Quality
- Automatic format selection (no manual configuration)
- Consistent type-appropriate pacing
- Appropriate instructional tone for each use case
- Optimal learning for different cognitive demands

## Future Enhancements

1. **Additional Types**
   - Technical vocabulary (slower, with examples)
   - Numbers/counting (repetition-heavy)
   - Customer service scripts (role-play format)

2. **Fine-Tuning**
   - A/B test pause durations
   - User feedback on pacing preferences
   - Adaptive difficulty (beginner vs advanced)

3. **Voice Variation**
   - Different voices for conversation roles
   - Emotional tone matching (serious for emergencies)
   - Gender variation for customer interactions

---

**Last Updated**: 2025-11-11
**Status**: ✅ Implemented & Tested
**Next Steps**: Run full regeneration with adaptive formats
