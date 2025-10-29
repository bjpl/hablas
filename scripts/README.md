# Hablas Audio Generation Scripts

This directory contains scripts for generating audio resources for the Hablas learning app.

## Phase 1 Audio Generation

### Overview

The `generate-phase1-audio.py` script generates 12 high-priority audio files using Google Text-to-Speech (gTTS) with slow speech rate for básico level learners.

### High-Priority Resources (Phase 1)

| ID | Title | Category | Language | Variant |
|----|-------|----------|----------|---------|
| 1 | Frases Esenciales - Var 1 | frases-esenciales | es-CO | 1 |
| 4 | Frases Esenciales - Var 2 | frases-esenciales | es-MX | 2 |
| 6 | Frases Esenciales - Var 3 | frases-esenciales | es-CO | 3 |
| 11 | Saludos Pasajeros - Var 1 | saludos | en-US | 1 |
| 14 | Saludos Pasajeros - Var 2 | saludos | en-US | 2 |
| 17 | Saludos Pasajeros - Var 3 | saludos | en-US | 3 |
| 22 | Números y Direcciones - Var 1 | numeros-direcciones | es-MX | 1 |
| 23 | Tiempo y Horarios | tiempo | es-CO | 1 |
| 27 | Frases de Emergencia | emergencia | es-US | 1 |
| 29 | Números y Direcciones - Var 2 | numeros-direcciones | es-MX | 2 |
| 48 | Medical Emergencies | emergency | en-US | 1 |
| 50 | Personal Safety | emergency | en-US | 2 |

### Installation

1. Install Python dependencies:

```bash
pip install -r scripts/requirements-audio.txt
```

Or install gTTS directly:

```bash
pip install gtts
```

### Usage

Run the script from the project root:

```bash
python scripts/generate-phase1-audio.py
```

Or make it executable and run directly:

```bash
chmod +x scripts/generate-phase1-audio.py
./scripts/generate-phase1-audio.py
```

### Output

The script generates:

1. **Audio Files**: MP3 files in `public/audio/` directory
   - Format: `{category}-var{variant}-{lang}.mp3`
   - Example: `frases-esenciales-var1-es.mp3`

2. **Metadata**: Updates `public/metadata.json` with:
   - Resource IDs
   - Filenames
   - File sizes
   - Generation timestamps
   - Phrase counts

3. **Generation Report**: Creates `scripts/phase1-generation-report.json` with:
   - Success/failure statistics
   - File sizes
   - Error details (if any)

### Features

- **Slow Speech Rate**: Uses `slow=True` for básico level learners
- **Multiple Languages**: Supports Spanish (es) and English (en) variations
- **Regional Variants**: Colombian (es-CO), Mexican (es-MX), US Spanish (es-US), and US English (en-US)
- **Error Handling**: Comprehensive logging and error reporting
- **Metadata Tracking**: Automatic metadata generation and updates

### File Structure

```
hablas/
├── scripts/
│   ├── generate-phase1-audio.py          # Main generation script
│   ├── requirements-audio.txt             # Python dependencies
│   ├── phase1-generation-report.json      # Generation report (created by script)
│   └── README.md                          # This file
├── public/
│   ├── audio/                             # Generated audio files (12 files)
│   │   ├── frases-esenciales-var1-es.mp3
│   │   ├── frases-esenciales-var2-es.mp3
│   │   ├── frases-esenciales-var3-es.mp3
│   │   ├── saludos-var1-en.mp3
│   │   ├── saludos-var2-en.mp3
│   │   ├── saludos-var3-en.mp3
│   │   ├── numeros-direcciones-var1-es.mp3
│   │   ├── tiempo-var1-es.mp3
│   │   ├── emergencia-var1-es.mp3
│   │   ├── numeros-direcciones-var2-es.mp3
│   │   ├── emergency-var1-en.mp3
│   │   └── emergency-var2-en.mp3
│   └── metadata.json                      # Updated metadata
```

### Logging

The script provides detailed logging:

```
2025-10-28 10:00:00 - INFO - ============================================================
2025-10-28 10:00:00 - INFO - Phase 1 Audio Generation - Hablas Learning App
2025-10-28 10:00:00 - INFO - ============================================================
2025-10-28 10:00:00 - INFO - Output directory: /path/to/public/audio
2025-10-28 10:00:00 - INFO - Total resources to generate: 12
2025-10-28 10:00:00 - INFO -
2025-10-28 10:00:01 - INFO - [1/12] Processing Resource 1...
2025-10-28 10:00:01 - INFO - Generating audio for Resource 1: Frases Esenciales - Variación 1
2025-10-28 10:00:02 - INFO - ✓ Generated: frases-esenciales-var1-es.mp3 (45678 bytes)
...
```

### Error Handling

If errors occur:
- Failed resources are logged with error details
- Generation continues for remaining resources
- Final report includes failure information
- Script exits with code 1 if any failures occurred

### Next Steps

After Phase 1 completion:
- Implement Phase 2 (resources 2, 3, 5, 7-10, 12-13, 15-16, 18-21, 24-26, 28, 30)
- Add support for different audio qualities
- Implement audio optimization (compression, normalization)
- Add voice variation options
- Create batch processing for larger sets

### Dependencies

- **Python**: 3.7+
- **gTTS**: Google Text-to-Speech library
- **Internet**: Required for gTTS API access

### Troubleshooting

**Issue**: ModuleNotFoundError: No module named 'gtts'
**Solution**: Install dependencies: `pip install gtts`

**Issue**: Permission denied when creating files
**Solution**: Ensure write permissions for `public/audio/` directory

**Issue**: Network errors during generation
**Solution**: Check internet connection (gTTS requires online access)

**Issue**: Audio quality issues
**Solution**: Phase 1 uses slow=True for learning. Adjust speed parameter in script if needed.

### License

Part of the Hablas learning application.
