# Audio Metadata Generator

## Overview

The `create-audio-metadata.ts` script generates structured audio metadata from audio specification files, creating a format compatible with the sinonimos_de_ver structure.

## Features

- **Automatic Voice Assignment**: Intelligently assigns Azure Neural voices based on:
  - Resource level (beginner, intermediate, advanced)
  - Gender preferences from voice profile
  - Regional accent distribution

- **Voice Profiles**: Pre-configured with 8 Azure Neural voices:
  - Colombian (CO): 2 voices - neutral Latin American accent
  - Mexican (MX): 2 voices - regional variety
  - Spanish (ES): 2 voices - European accent
  - US English (US): 2 voices - for bilingual content

- **Statistics Generation**: Provides comprehensive analytics:
  - Voice distribution across resources
  - Level distribution (basico, intermedio, avanzado)
  - Category distribution (repartidor, conductor, etc.)
  - Usage tracking for each voice profile

## Usage

### Basic Command

```bash
npx tsx scripts/create-audio-metadata.ts
```

### Output

The script generates `public/audio/metadata.json` with this structure:

```json
{
  "resources": {
    "2": {
      "file": "/audio/resource-2.mp3",
      "voice": "co_female_1",
      "text": "Pronunciación: Entregas - Var 1",
      "duration": "7:15 minutes",
      "level": "basico",
      "category": "repartidor"
    }
  },
  "voices": {
    "co_female_1": {
      "name": "es-CO-SalomeNeural",
      "region": "CO",
      "gender": "female",
      "description": "Warm, clear Colombian female voice"
    }
  },
  "statistics": {
    "totalResources": 9,
    "voiceDistribution": { "co_female_1": 9 },
    "levelDistribution": { "basico": 9 },
    "categoryDistribution": { "repartidor": 4 }
  }
}
```

## Voice Assignment Logic

### Level-Based Assignment

1. **Beginner (basico)**: Colombian voices (most neutral accent)
   - Female: `co_female_1` (es-CO-SalomeNeural)
   - Male: `co_female_2` (es-CO-GonzaloNeural)

2. **Intermediate (intermedio)**: Mexican voices (regional variety)
   - Female: `mx_female_1` (es-MX-DaliaNeural)
   - Male: `mx_male_1` (es-MX-JorgeNeural)

3. **Advanced (avanzado)**: Spanish voices (European accent)
   - Female: `es_female_1` (es-ES-ElviraNeural)
   - Male: `es_male_1` (es-ES-AlvaroNeural)

### Gender Detection

The script analyzes the `voiceProfile.gender` field from audio specs to determine voice assignment.

## Input Requirements

The script reads from `audio-specs/*.json` files. Each spec must include:

```json
{
  "metadata": {
    "resourceId": 2,
    "title": "Resource Title",
    "level": "basico",
    "category": "repartidor"
  },
  "voiceProfile": {
    "gender": "Male or Female (clear, warm voice)"
  }
}
```

## Output Directory

- **Output**: `public/audio/metadata.json`
- **Auto-creation**: The script creates the directory if it doesn't exist

## Statistics Report

After generation, the script prints:

```
============================================================
AUDIO METADATA GENERATION SUMMARY
============================================================

Total Resources: 9

Voice Distribution:
  co_female_1       9 resources - es-CO-SalomeNeural (Colombia)

Level Distribution:
  basico            9 resources

Category Distribution:
  repartidor        4 resources
  conductor         3 resources

Available Voices:
  co_female_1     es-CO-SalomeNeural        (9 resources)
  co_female_2     es-CO-GonzaloNeural       (unused)
  ...
```

## Integration with Audio Generation

This metadata file is designed to work with:

1. **Audio synthesis tools**: Use voice profiles for TTS generation
2. **Frontend applications**: Load metadata for audio player UI
3. **Resource management**: Track audio files and their characteristics
4. **Quality assurance**: Verify voice distribution and coverage

## Extending Voice Profiles

To add new voices, edit the `VOICE_PROFILES` constant:

```typescript
const VOICE_PROFILES = {
  new_voice_id: {
    name: 'es-AR-ElenaNeural',  // Azure Neural voice name
    region: 'AR',                // Region code
    gender: 'female',            // Gender
    description: 'Voice description'
  }
};
```

## Error Handling

The script includes:
- File validation before processing
- Error reporting for invalid specs
- Graceful handling of missing fields
- Process exit code for CI/CD integration

## Related Scripts

- `generate-audio-specs.ts`: Creates audio specification files
- `ai-generate-resources.ts`: Generates resource content
- `integrate-resources.ts`: Integrates resources into database

## Notes

- All resources must have a valid audio spec file
- Voice assignment is deterministic (same spec = same voice)
- Statistics are regenerated on each run
- The script is safe to run multiple times (idempotent)
