# Audio Recording Instructions

This directory contains detailed specifications for recording audio content for the Hablas language learning app.

## Quick Start

1. **Review Files**:
   - `RECORDING-SUMMARY.md` - Overview of all audio resources
   - `resource-[ID]-spec.json` - Individual recording specifications

2. **Voice Talent Requirements**:
   - Spanish Narrator: Neutral Latin American accent (Colombian/Mexican)
   - English Speaker: Neutral American accent (General American)
   - Age Range: 30-45 years (mature, professional sound)
   - Tone: Warm, encouraging, patient, professional

3. **Recording Setup**:
   - Professional studio or treated room
   - Pop filter and shock mount required
   - Minimal background noise (<-60dB)
   - Consistent microphone position

## Technical Specifications

### Audio Format
```
Format: MP3
Codec: MPEG-1 Audio Layer 3
Bitrate: 128kbps (CBR - Constant Bit Rate)
Sample Rate: 44.1kHz
Channels: Stereo
Target File Size: 7-10MB per resource
```

### Recording Quality
- **Microphone**: Large diaphragm condenser or broadcast quality
- **Preamp**: Clean, low noise (<-120dB EIN)
- **Recording Level**: Peak at -6dB to -3dB (leave headroom)
- **Room Treatment**: Minimal reverb/echo
- **Monitoring**: Studio monitors or high-quality headphones

## Production Guidelines

### 1. Pacing

**Spanish Narrator**:
- Base speed: 150 words per minute
- Clear articulation with natural rhythm
- Warm, conversational delivery

**English Speaker**:
- Beginner sections: 120 WPM (80% of normal speed)
- Practice sections: 150 WPM (normal speed)
- Deliberate enunciation
- Natural American pronunciation patterns

### 2. Pauses (CRITICAL)

These pauses are essential for learning retention:

- **Between English phrases**: 3 seconds (learner repetition time)
- **Between sections**: 2 seconds (mental transition)
- **During rapid practice**: 1.5 seconds (quick recall)
- **Before/after emphasis**: 0.5 seconds (attention marker)

### 3. Emphasis and Tone

**Tone Markers**:
- `[Warm]` - Friendly, encouraging delivery
- `[Professional]` - Clear, business-like tone
- `[Energetic]` - Upbeat, motivational
- `[Calm]` - Soothing, patient delivery

**Emphasis Points**:
- Key vocabulary words: Slightly louder, clear
- Action phrases: Confident delivery
- Safety information: Serious, clear tone

### 4. Background Music

**Placement**: Intro and outro sections ONLY
**Volume**: -30dB (very subtle, non-intrusive)
**Style**: Soft ambient, minimal instrumentation
**Fade**: 2-second fade in/out
**Purpose**: Enhance professionalism, not distract

## Recording Workflow

### Pre-Production

1. **Script Review**: Read entire script 3 times before recording
2. **Pronunciation Check**: Verify all English phrases with native speaker
3. **Timing Run**: Perform timed read-through
4. **Microphone Check**: Test levels, eliminate plosives

### Recording Session

1. **Warm-up**: 5-10 minutes vocal warm-up exercises
2. **Record in Sections**: Follow JSON segment structure
3. **Multiple Takes**: Record 2-3 takes per segment, select best
4. **Maintain Energy**: Take breaks every 15-20 minutes
5. **Consistency**: Monitor tone and pace throughout

### Post-Production

1. **Edit**: Select best takes, remove mistakes
2. **Timing**: Verify pause durations match specifications
3. **Normalize**: Peak at -1dB to -0.5dB
4. **EQ**: Light high-pass filter (<80Hz), de-ess if needed
5. **Compress**: Gentle compression (3:1 ratio, -15dB threshold)
6. **Background Music**: Add to intro/outro at -30dB
7. **Export**: MP3 128kbps 44.1kHz stereo
8. **Quality Check**: Listen on multiple devices (phone, headphones, car)

## File Naming Convention

```
hablas-audio-[resourceID]-[category]-[level].mp3
```

**Examples**:
- `hablas-audio-002-repartidor-basico.mp3`
- `hablas-audio-013-conductor-basico.mp3`
- `hablas-audio-021-all-basico.mp3`

## Quality Assurance Checklist

- [ ] All pauses match specification timings
- [ ] English phrases recorded at correct speed (80% or 100%)
- [ ] Spanish narration is clear and warm
- [ ] Background music only in intro/outro
- [ ] No clipping or distortion
- [ ] Consistent volume throughout
- [ ] File format matches specifications (MP3 128kbps)
- [ ] File size within target range (7-10MB)
- [ ] Tested on mobile device
- [ ] Duration matches estimate (±30 seconds acceptable)

## Delivery Format

Submit recordings as:
1. **MP3 File**: Final production-ready audio
2. **Metadata**: Resource ID, duration, file size
3. **Notes**: Any deviations from specifications

## Directory Structure

```
audio-specs/
├── README.md                    (this file)
├── RECORDING-SUMMARY.md         (overview of all resources)
├── resource-2-spec.json         (individual specifications)
├── resource-7-spec.json
├── resource-10-spec.json
└── ...
```

## JSON Specification Format

Each `resource-[ID]-spec.json` file contains:

```json
{
  "metadata": {
    "resourceId": 2,
    "title": "Pronunciación: Entregas - Var 1",
    "category": "repartidor",
    "level": "basico",
    "language": "Bilingual (Spanish/English)",
    "targetAudience": "Delivery drivers (Beginner level)",
    "estimatedDuration": "7:15 minutes"
  },
  "recording": {
    "format": "MP3",
    "bitrate": "128kbps",
    "sampleRate": "44.1kHz",
    "channels": "Stereo"
  },
  "voiceProfile": { ... },
  "production": { ... },
  "content": {
    "segments": [
      {
        "timestamp": "00:00 - 00:50",
        "speaker": "Spanish narrator",
        "language": "spanish",
        "tone": "Warm, encouraging",
        "text": "¡Hola, repartidor! Bienvenido a Hablas...",
        "pace": "normal",
        "notes": "Introduction section"
      }
    ]
  }
}
```

## Usage Example

1. Run the generator to create specifications:
   ```bash
   npm run generate:audio-specs
   # or
   ts-node scripts/generate-audio-specs.ts
   ```

2. Review `RECORDING-SUMMARY.md` for overview

3. Open individual JSON files for detailed segment information

4. Follow recording workflow above

5. Deliver final MP3 files with proper naming

## Support

For questions or issues:
- Review source audio scripts in `generated-resources/50-batch/`
- Check individual JSON spec files for segment details
- Refer to this README for general guidelines

---

**Generated by**: generate-audio-specs.ts
**Last Updated**: 2025-10-28
