#!/usr/bin/env python3
"""
Complete Audio Regeneration from Source Markdown
Extracts ALL phrases from source markdown and generates complete audio
"""

import os
import re
import subprocess
import sys
import time
from datetime import datetime
from typing import List, Dict, Tuple

# Resource mapping: ID -> Source markdown file
RESOURCE_MAPPING = {
    22: 'generated-resources/50-batch/all/basic_numbers_1.md',
    23: 'generated-resources/50-batch/all/basic_time_1.md',
    25: 'generated-resources/50-batch/all/intermediate_customer_service_1.md',
    29: 'generated-resources/50-batch/all/basic_numbers_2.md',
    30: 'generated-resources/50-batch/all/safety_protocols_1.md',
    31: 'generated-resources/50-batch/repartidor/intermediate_situations_2.md',
    33: 'generated-resources/50-batch/conductor/intermediate_smalltalk_2.md',
}

def extract_phrases_from_markdown(md_file: str) -> List[Dict]:
    """Extract ALL bilingual phrases from structured markdown"""

    if not os.path.exists(md_file):
        print(f"  ✗ Markdown file not found: {md_file}")
        return []

    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()

    phrases = []

    # Pattern 1: Box format with English and Español
    box_pattern = r'│\s*\*\*English\*\*:\s*"([^"]+)".*?│\s*🗣️\s*\*\*Español\*\*:\s*([^\n]+)'
    matches = re.findall(box_pattern, content, re.DOTALL)

    for english, spanish in matches:
        phrases.append({
            'english': english.strip(),
            'spanish': spanish.strip()
        })

    # Pattern 2: Simple English/Español format
    simple_pattern = r'\*\*English\*\*:\s*"([^"]+)".*?\*\*Español\*\*:\s*([^\n]+)'
    if not phrases:
        matches = re.findall(simple_pattern, content, re.DOTALL)
        for english, spanish in matches:
            phrases.append({
                'english': english.strip(),
                'spanish': spanish.strip()
            })

    # Pattern 3: Bullet format
    bullet_pattern = r'-\s*\*\*English\*\*:\s*([^\n]+)\n\s*-\s*\*\*Español\*\*:\s*([^\n]+)'
    if not phrases:
        matches = re.findall(bullet_pattern, content)
        for english, spanish in matches:
            phrases.append({
                'english': english.strip(),
                'spanish': spanish.strip()
            })

    # Clean up phrases
    cleaned_phrases = []
    for idx, phrase in enumerate(phrases, 1):
        english = phrase['english'].strip('"').strip()
        spanish = phrase['spanish'].strip('"').strip()

        # Remove pronunciation guides and emoji
        spanish = re.sub(r'\[.*?\]', '', spanish)
        spanish = re.sub(r'[🗣️🔊💡]', '', spanish)
        spanish = spanish.strip()

        if english and spanish and len(english) > 2 and len(spanish) > 2:
            cleaned_phrases.append({
                'number': idx,
                'english': english,
                'spanish': spanish
            })

    return cleaned_phrases

def create_tutorial_script(resource_id: int, title: str, phrases: List[Dict]) -> str:
    """Create complete tutorial audio script"""

    script = f"""¡Hola! Bienvenido a Hablas. Soy tu instructor de inglés para trabajadores de gig economy.

En esta lección vas a aprender {len(phrases)} frases esenciales: {title}.

Cada frase la voy a decir DOS veces en inglés, pronunciada lentamente y con claridad. Después te doy la traducción al español.

Mi consejo: Escucha todo primero. Luego repite mientras trabajas. La repetición es la clave del aprendizaje.

¿Listo? ¡Comenzamos!

"""

    # Main teaching section - each phrase twice
    for phrase in phrases:
        script += f"""Frase número {phrase['number']}:
{phrase['english']}

{phrase['english']}

En español: {phrase['spanish']}

"""

    # Practice section
    script += f"""¡Excelente! Ahora viene la práctica rápida.

Voy a decir las {len(phrases)} frases en inglés a velocidad normal. Repite después de cada una en voz alta.

¿Listo? ¡Aquí vamos!

"""

    for phrase in phrases:
        script += f"{phrase['english']}\n\n"

    # Conclusion
    script += f"""¡Muy bien! ¡Lo estás haciendo increíble!

Felicidades. Acabas de completar la lección de {title}.

Estas {len(phrases)} frases van a hacer tu trabajo más fácil, más profesional, y van a aumentar tus propinas.

Mi recomendación: Escucha este audio dos veces al día durante una semana. Una vez en la mañana antes de trabajar, y otra en la noche antes de dormir.

Recuerda: Cada palabra que aprendes es dinero en tu bolsillo.

¡Nos vemos en la siguiente lección!
"""

    return script

def generate_audio_with_edge_tts(resource_id: int, script: str) -> bool:
    """Generate audio using edge-tts"""

    try:
        output_path = f"out/audio/resource-{resource_id}.mp3"
        os.makedirs('out/audio', exist_ok=True)

        # Generate with edge-tts
        cmd = [
            'edge-tts',
            '--voice', 'es-MX-DaliaNeural',
            '--rate=-5%',  # Slightly slower for clarity
            '--text', script,
            '--write-media', output_path
        ]

        print(f"  Generating audio...")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)

        if result.returncode == 0:
            file_size = os.path.getsize(output_path)
            file_size_mb = file_size / (1024 * 1024)
            print(f"  ✓ Audio generated: {file_size_mb:.2f} MB")

            # Copy to public/audio
            public_path = f"public/audio/resource-{resource_id}.mp3"
            os.makedirs('public/audio', exist_ok=True)
            subprocess.run(['cp', output_path, public_path], check=True)
            print(f"  ✓ Copied to public: {public_path}")

            return True
        else:
            print(f"  ✗ Generation failed: {result.stderr}")
            return False

    except subprocess.TimeoutExpired:
        print(f"  ✗ Timeout (>600s)")
        return False
    except Exception as e:
        print(f"  ✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def process_resource(resource_id: int) -> Tuple[bool, int]:
    """Process a single resource - returns (success, phrase_count)"""

    if resource_id not in RESOURCE_MAPPING:
        print(f"  ✗ No source mapping for resource {resource_id}")
        return False, 0

    md_file = RESOURCE_MAPPING[resource_id]
    title = os.path.basename(md_file).replace('.md', '').replace('_', ' ').title()

    print(f"\n{'='*70}")
    print(f"Resource {resource_id}: {title}")
    print(f"Source: {md_file}")
    print(f"{'='*70}")

    # Extract phrases
    print(f"  1. Extracting phrases from markdown...")
    phrases = extract_phrases_from_markdown(md_file)

    if not phrases:
        print(f"  ✗ No phrases extracted")
        return False, 0

    print(f"  ✓ Extracted {len(phrases)} phrases")

    # Save phrase list for verification
    phrase_list_path = f"scripts/extracted-phrases/resource-{resource_id}-phrases.txt"
    os.makedirs('scripts/extracted-phrases', exist_ok=True)
    with open(phrase_list_path, 'w', encoding='utf-8') as f:
        for p in phrases:
            f.write(f"{p['number']}. {p['english']}\n")
            f.write(f"   {p['spanish']}\n\n")
    print(f"  ✓ Saved phrase list: {phrase_list_path}")

    # Create script
    print(f"  2. Creating tutorial script...")
    script = create_tutorial_script(resource_id, title, phrases)

    script_path = f"scripts/complete-scripts/resource-{resource_id}-complete.txt"
    os.makedirs('scripts/complete-scripts', exist_ok=True)
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(script)

    print(f"  ✓ Script created: {len(script)} chars")
    print(f"  ✓ Saved: {script_path}")

    # Generate audio
    print(f"  3. Generating audio with edge-tts...")
    if generate_audio_with_edge_tts(resource_id, script):
        print(f"  ✓ Resource {resource_id} COMPLETE")
        return True, len(phrases)
    else:
        print(f"  ✗ Resource {resource_id} FAILED")
        return False, 0

def main():
    """Main execution"""

    print("="*70)
    print("COMPLETE AUDIO REGENERATION FROM SOURCE MARKDOWN")
    print("="*70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    results = {
        'success': [],
        'failed': [],
        'total_phrases': 0
    }

    total_start = time.time()

    for idx, resource_id in enumerate(sorted(RESOURCE_MAPPING.keys()), 1):
        print(f"\n[{idx}/{len(RESOURCE_MAPPING)}]")
        success, phrase_count = process_resource(resource_id)

        if success:
            results['success'].append(resource_id)
            results['total_phrases'] += phrase_count
        else:
            results['failed'].append(resource_id)

        # Delay between resources
        if idx < len(RESOURCE_MAPPING):
            time.sleep(3)

    # Summary
    total_time = time.time() - total_start

    print("\n" + "="*70)
    print("REGENERATION COMPLETE")
    print("="*70)
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total Time: {total_time/60:.1f} minutes")
    print(f"Success: {len(results['success'])}/{len(RESOURCE_MAPPING)}")
    print(f"Total Phrases: {results['total_phrases']}")

    if results['success']:
        print(f"\n✓ Success: {', '.join(map(str, results['success']))}")

    if results['failed']:
        print(f"\n✗ Failed: {', '.join(map(str, results['failed']))}")
        return 1

    print("\n✓ All resources regenerated with COMPLETE phrase sets!")
    print("\nNext steps:")
    print("1. Verify audio files sound complete")
    print("2. Check phrase counts match expectations")
    print("3. Update service worker cache version")
    print("4. Run: npm run build")
    print("5. Deploy to production")

    return 0

if __name__ == "__main__":
    sys.exit(main())
