#!/usr/bin/env python3
"""
Phase 1 Audio Generation Script
Generates 12 high-priority audio files for Hablas learning app.
Uses gTTS (Google Text-to-Speech) with slow=True for básico level.
"""

import os
import json
from pathlib import Path
from datetime import datetime
from gtts import gTTS
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
AUDIO_OUTPUT_DIR = PROJECT_ROOT / "public" / "audio"
METADATA_PATH = PROJECT_ROOT / "public" / "metadata.json"

# Ensure output directory exists
AUDIO_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Phase 1 High-Priority Resources Configuration
PHASE1_RESOURCES = [
    {
        "id": 1,
        "title": "Frases Esenciales - Variación 1",
        "level": "básico",
        "category": "frases-esenciales",
        "language": "es-CO",
        "variant": 1,
        "phrases": [
            "Buenos días, ¿cómo está?",
            "¿A dónde vamos?",
            "Por favor, cierre la puerta",
            "Gracias por esperar",
            "¿Necesita ayuda con las bolsas?",
            "Aquí está su pedido",
            "Que tenga un buen día"
        ]
    },
    {
        "id": 4,
        "title": "Frases Esenciales - Variación 2",
        "level": "básico",
        "category": "frases-esenciales",
        "language": "es-MX",
        "variant": 2,
        "phrases": [
            "¿Qué tal? ¿Cómo le va?",
            "¿Cuál es su destino?",
            "Por favor, póngase el cinturón",
            "Disculpe la demora",
            "¿Le ayudo con su equipaje?",
            "Su orden está completa",
            "Que le vaya bien"
        ]
    },
    {
        "id": 6,
        "title": "Frases Esenciales - Variación 3",
        "level": "básico",
        "category": "frases-esenciales",
        "language": "es-CO",
        "variant": 3,
        "phrases": [
            "Hola, bienvenido",
            "¿A qué dirección vamos?",
            "Por favor, cierre bien la puerta",
            "Gracias por su paciencia",
            "¿Puedo ayudarle con algo?",
            "Todo está listo",
            "Hasta luego"
        ]
    },
    {
        "id": 11,
        "title": "Saludos Pasajeros - Variación 1",
        "level": "básico",
        "category": "saludos",
        "language": "en-US",
        "variant": 1,
        "phrases": [
            "Good morning! How are you today?",
            "Welcome! Where are we going?",
            "Please buckle up for safety",
            "Thank you for your patience",
            "Do you need any help?",
            "Have a great day!",
            "Thank you, goodbye!"
        ]
    },
    {
        "id": 14,
        "title": "Saludos Pasajeros - Variación 2",
        "level": "básico",
        "category": "saludos",
        "language": "en-US",
        "variant": 2,
        "phrases": [
            "Hello! Good to see you",
            "What's your destination today?",
            "Please close the door",
            "Thanks for waiting",
            "Can I help with your bags?",
            "Here's your order",
            "Take care!"
        ]
    },
    {
        "id": 17,
        "title": "Saludos Pasajeros - Variación 3",
        "level": "básico",
        "category": "saludos",
        "language": "en-US",
        "variant": 3,
        "phrases": [
            "Hi there! Welcome aboard",
            "Where can I take you?",
            "Make sure the door is closed",
            "I appreciate your patience",
            "Need any assistance?",
            "Everything is ready",
            "See you next time!"
        ]
    },
    {
        "id": 22,
        "title": "Números y Direcciones - Variación 1",
        "level": "básico",
        "category": "numeros-direcciones",
        "language": "es-MX",
        "variant": 1,
        "phrases": [
            "Número uno",
            "Número cinco",
            "Número diez",
            "Gire a la izquierda",
            "Gire a la derecha",
            "Siga derecho",
            "Estamos cerca"
        ]
    },
    {
        "id": 23,
        "title": "Tiempo y Horarios",
        "level": "básico",
        "category": "tiempo",
        "language": "es-CO",
        "variant": 1,
        "phrases": [
            "¿Qué hora es?",
            "Son las dos de la tarde",
            "Llegaremos en cinco minutos",
            "Hay mucho tráfico ahora",
            "Disculpe el retraso",
            "Estamos a tiempo",
            "Ya casi llegamos"
        ]
    },
    {
        "id": 27,
        "title": "Frases de Emergencia",
        "level": "básico",
        "category": "emergencia",
        "language": "es-US",
        "variant": 1,
        "phrases": [
            "¡Ayuda! ¡Emergencia!",
            "Llamaré a la policía",
            "Necesito un médico",
            "¿Está usted bien?",
            "No se mueva, por favor",
            "Voy a llamar al nueve uno uno",
            "Mantenga la calma"
        ]
    },
    {
        "id": 29,
        "title": "Números y Direcciones - Variación 2",
        "level": "básico",
        "category": "numeros-direcciones",
        "language": "es-MX",
        "variant": 2,
        "phrases": [
            "Primer piso",
            "Segunda puerta",
            "Tercera calle",
            "Doble en la esquina",
            "Está del lado derecho",
            "Es el edificio azul",
            "Ya llegamos"
        ]
    },
    {
        "id": 48,
        "title": "Medical Emergencies",
        "level": "básico",
        "category": "emergency",
        "language": "en-US",
        "variant": 1,
        "phrases": [
            "Are you feeling okay?",
            "I'm calling nine one one",
            "Do you need an ambulance?",
            "Stay calm, help is coming",
            "Don't move, please",
            "Can you breathe okay?",
            "Where does it hurt?"
        ]
    },
    {
        "id": 50,
        "title": "Personal Safety",
        "level": "básico",
        "category": "emergency",
        "language": "en-US",
        "variant": 2,
        "phrases": [
            "Please exit the vehicle",
            "I'm contacting the authorities",
            "This is an emergency",
            "Help is on the way",
            "Stay where you are",
            "I need to report this",
            "Please remain calm"
        ]
    }
]


def generate_audio_file(resource_data):
    """
    Generate audio file using gTTS for a given resource.

    Args:
        resource_data (dict): Resource configuration with phrases and metadata

    Returns:
        dict: Generation result with success status and file path
    """
    try:
        resource_id = resource_data["id"]
        title = resource_data["title"]
        language = resource_data["language"]
        phrases = resource_data["phrases"]

        logger.info(f"Generating audio for Resource {resource_id}: {title}")

        # Combine all phrases with pauses (represented by commas and periods)
        combined_text = ". ".join(phrases) + "."

        # Extract language code (e.g., 'es' from 'es-CO', 'en' from 'en-US')
        lang_code = language.split('-')[0]

        # Generate filename
        category = resource_data["category"]
        variant = resource_data["variant"]
        filename = f"{category}-var{variant}-{lang_code}.mp3"
        output_path = AUDIO_OUTPUT_DIR / filename

        # Generate audio using gTTS with slow=True for básico level
        tts = gTTS(text=combined_text, lang=lang_code, slow=True)
        tts.save(str(output_path))

        # Verify file was created
        if output_path.exists():
            file_size = output_path.stat().st_size
            logger.info(f"✓ Generated: {filename} ({file_size} bytes)")

            return {
                "success": True,
                "resource_id": resource_id,
                "title": title,
                "filename": filename,
                "path": str(output_path),
                "size_bytes": file_size,
                "language": language,
                "phrases_count": len(phrases)
            }
        else:
            raise Exception("File was not created")

    except Exception as e:
        logger.error(f"✗ Failed to generate Resource {resource_id}: {str(e)}")
        return {
            "success": False,
            "resource_id": resource_data["id"],
            "title": resource_data["title"],
            "error": str(e)
        }


def update_metadata(results):
    """
    Update or create metadata.json with generation results.

    Args:
        results (list): List of generation results
    """
    try:
        # Load existing metadata if it exists
        if METADATA_PATH.exists():
            with open(METADATA_PATH, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
        else:
            metadata = {
                "version": "1.0.0",
                "generated": datetime.now().isoformat(),
                "resources": []
            }

        # Update generation timestamp
        metadata["generated"] = datetime.now().isoformat()

        # Update or add resource entries
        for result in results:
            if result["success"]:
                resource_entry = {
                    "id": result["resource_id"],
                    "title": result["title"],
                    "filename": result["filename"],
                    "language": result["language"],
                    "size_bytes": result["size_bytes"],
                    "phrases_count": result["phrases_count"],
                    "generated": datetime.now().isoformat()
                }

                # Remove existing entry with same ID if present
                metadata["resources"] = [
                    r for r in metadata["resources"]
                    if r.get("id") != result["resource_id"]
                ]

                # Add new entry
                metadata["resources"].append(resource_entry)

        # Sort resources by ID
        metadata["resources"].sort(key=lambda x: x.get("id", 0))

        # Save metadata
        with open(METADATA_PATH, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

        logger.info(f"✓ Updated metadata: {METADATA_PATH}")

    except Exception as e:
        logger.error(f"✗ Failed to update metadata: {str(e)}")


def generate_report(results):
    """
    Generate and save a detailed generation report.

    Args:
        results (list): List of generation results

    Returns:
        dict: Summary statistics
    """
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]

    total_size = sum(r.get("size_bytes", 0) for r in successful)
    total_phrases = sum(r.get("phrases_count", 0) for r in successful)

    report = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total_resources": len(results),
            "successful": len(successful),
            "failed": len(failed),
            "success_rate": f"{(len(successful) / len(results) * 100):.1f}%",
            "total_audio_size_mb": f"{(total_size / 1024 / 1024):.2f}",
            "total_phrases": total_phrases
        },
        "successful_resources": [
            {
                "id": r["resource_id"],
                "title": r["title"],
                "filename": r["filename"],
                "size_kb": f"{(r['size_bytes'] / 1024):.2f}"
            }
            for r in successful
        ],
        "failed_resources": [
            {
                "id": r["resource_id"],
                "title": r["title"],
                "error": r["error"]
            }
            for r in failed
        ]
    }

    # Save report
    report_path = PROJECT_ROOT / "scripts" / "phase1-generation-report.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    logger.info(f"✓ Saved report: {report_path}")

    return report["summary"]


def main():
    """Main execution function."""
    logger.info("=" * 60)
    logger.info("Phase 1 Audio Generation - Hablas Learning App")
    logger.info("=" * 60)
    logger.info(f"Output directory: {AUDIO_OUTPUT_DIR}")
    logger.info(f"Total resources to generate: {len(PHASE1_RESOURCES)}")
    logger.info("")

    # Generate audio files
    results = []
    for i, resource in enumerate(PHASE1_RESOURCES, 1):
        logger.info(f"[{i}/{len(PHASE1_RESOURCES)}] Processing Resource {resource['id']}...")
        result = generate_audio_file(resource)
        results.append(result)
        logger.info("")

    # Update metadata
    logger.info("Updating metadata...")
    update_metadata(results)
    logger.info("")

    # Generate report
    logger.info("Generating report...")
    summary = generate_report(results)
    logger.info("")

    # Print summary
    logger.info("=" * 60)
    logger.info("GENERATION COMPLETE")
    logger.info("=" * 60)
    logger.info(f"Total Resources: {summary['total_resources']}")
    logger.info(f"Successful: {summary['successful']}")
    logger.info(f"Failed: {summary['failed']}")
    logger.info(f"Success Rate: {summary['success_rate']}")
    logger.info(f"Total Audio Size: {summary['total_audio_size_mb']} MB")
    logger.info(f"Total Phrases: {summary['total_phrases']}")
    logger.info("=" * 60)

    # Exit with appropriate code
    exit_code = 0 if summary['failed'] == 0 else 1
    return exit_code


if __name__ == "__main__":
    try:
        exit_code = main()
        exit(exit_code)
    except KeyboardInterrupt:
        logger.warning("\nGeneration interrupted by user")
        exit(130)
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        exit(1)
