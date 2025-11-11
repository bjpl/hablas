#!/usr/bin/env python3
"""
Systematic Audio Fix - Regenerate ALL resources with proper verification
Uses source truth and deployment verification to fix issues systematically
"""
import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional
import subprocess
import time

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Language detection patterns
SPANISH_PATTERNS = [
    r'\b(yo|tú|él|ella|usted|nosotros|ustedes|ellos|ellas)\b',
    r'\b(sí|no|por favor|gracias|disculpe|perdón)\b',
    r'\b(está|son|hay|tiene|quiero|necesito)\b',
    r'\b(dónde|cuándo|cómo|qué|quién|cuál)\b',
    r'[¿¡]',  # Spanish punctuation
]

ENGLISH_PATTERNS = [
    r'\b(I|you|he|she|we|they|it)\b',
    r'\b(yes|no|please|thank|sorry|excuse)\b',
    r'\b(is|are|have|has|want|need|can|will)\b',
    r'\b(where|when|how|what|who|which)\b',
    r'\b(the|a|an|this|that|these|those)\b',
]

def detect_language(text: str) -> str:
    """
    Detect if text is Spanish or English
    Returns 'es-MX' or 'en-US'
    """
    text_lower = text.lower()

    spanish_score = sum(
        1 for pattern in SPANISH_PATTERNS
        if re.search(pattern, text_lower, re.IGNORECASE)
    )

    english_score = sum(
        1 for pattern in ENGLISH_PATTERNS
        if re.search(pattern, text_lower, re.IGNORECASE)
    )

    # If text has Spanish punctuation, it's definitely Spanish
    if re.search(r'[¿¡]', text):
        return 'es-MX'

    # Compare scores
    if spanish_score > english_score:
        return 'es-MX'
    elif english_score > spanish_score:
        return 'en-US'
    else:
        # Default based on character patterns
        # Spanish has more vowels and accented characters
        if re.search(r'[áéíóúñü]', text_lower):
            return 'es-MX'
        return 'en-US'

def get_voice_for_language(language: str) -> str:
    """Get appropriate voice ID for language"""
    if language == 'es-MX':
        return 'es-MX-Standard-A'  # Female Spanish voice
    else:
        return 'en-US-Standard-C'  # Female English voice

def create_audio_script(phrases: List[str], resource_id: int, output_dir: Path) -> Path:
    """
    Create properly formatted audio script with correct voice assignments
    """
    script_lines = []

    for phrase in phrases:
        # Detect language
        lang = detect_language(phrase)
        voice = get_voice_for_language(lang)

        # Format: [voice_id] "phrase"
        script_lines.append(f'[{voice}] "{phrase}"')

    # Save script
    script_file = output_dir / f'resource-{resource_id}-fixed-script.txt'
    with open(script_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(script_lines))

    return script_file

def generate_audio_from_script(script_file: Path, output_file: Path) -> bool:
    """
    Generate audio using the azure-tts-batch.py script
    Returns True if successful
    """
    try:
        # Path to batch generation script
        batch_script = script_file.parent.parent / 'azure-tts-batch.py'

        if not batch_script.exists():
            print(f"  ✗ Batch script not found: {batch_script}")
            return False

        print(f"  Generating audio with batch script...")

        # Run batch script
        result = subprocess.run(
            ['python3', str(batch_script), str(script_file), str(output_file)],
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )

        if result.returncode == 0 and output_file.exists():
            size_mb = output_file.stat().st_size / (1024 * 1024)
            print(f"  ✓ Audio generated: {size_mb:.2f} MB")
            return True
        else:
            print(f"  ✗ Generation failed")
            if result.stderr:
                print(f"    Error: {result.stderr[:200]}")
            return False

    except subprocess.TimeoutExpired:
        print(f"  ✗ Generation timed out")
        return False
    except Exception as e:
        print(f"  ✗ Generation error: {e}")
        return False

def verify_generated_audio(audio_file: Path, expected_phrases: int) -> Dict[str, Any]:
    """Verify that generated audio matches expectations"""

    if not audio_file.exists():
        return {
            'success': False,
            'reason': 'File not created'
        }

    size_mb = audio_file.stat().st_size / (1024 * 1024)

    # Estimate phrases from size (100 KB per phrase average)
    estimated_phrases = int((size_mb * 1024) / 100)

    # Get duration if possible
    try:
        result = subprocess.run(
            ['ffprobe', '-v', 'error', '-show_entries',
             'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1',
             str(audio_file)],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            duration = float(result.stdout.strip())
            estimated_from_duration = int(duration / 6.5)
            estimated_phrases = max(estimated_phrases, estimated_from_duration)
    except:
        pass

    # Check if estimated matches expected (within 10% tolerance)
    ratio = estimated_phrases / expected_phrases if expected_phrases > 0 else 0

    if ratio >= 0.9 and ratio <= 1.1:
        return {
            'success': True,
            'size_mb': round(size_mb, 2),
            'estimated_phrases': estimated_phrases,
            'expected_phrases': expected_phrases,
            'ratio': round(ratio, 2)
        }
    else:
        return {
            'success': False,
            'reason': f'Phrase count mismatch: estimated {estimated_phrases}, expected {expected_phrases}',
            'size_mb': round(size_mb, 2),
            'ratio': round(ratio, 2)
        }

def fix_resource(resource_id: int, source_info: Dict[str, Any],
                 deploy_info: Optional[Dict[str, Any]],
                 temp_dir: Path, output_audio_dir: Path) -> Dict[str, Any]:
    """
    Fix a single resource systematically
    """

    print(f"\n{'='*70}")
    print(f"Resource {resource_id}")
    print(f"{'='*70}")

    result = {
        'resource_id': resource_id,
        'success': False,
        'steps': []
    }

    # Check if source available
    if source_info['source'] == 'MISSING':
        result['steps'].append('Source file missing - cannot fix')
        return result

    expected_phrases = source_info['expected_phrases']
    print(f"Source: {source_info['source']}")
    print(f"Expected phrases: {expected_phrases}")

    # Check if already correct
    if deploy_info and deploy_info['status'] == 'LIKELY_COMPLETE':
        print(f"Status: Already complete (ratio: {deploy_info['completeness_ratio']})")
        result['steps'].append('Already complete - skipping')
        result['success'] = True
        return result

    # Load source file and extract phrases
    project_root = Path(__file__).parent.parent
    source_file = project_root / source_info['source']

    # Import extraction functions from verify-source-truth.py
    from importlib.util import spec_from_file_location, module_from_spec
    verify_module_path = Path(__file__).parent / 'verify-source-truth.py'
    spec = spec_from_file_location("verify_source_truth", verify_module_path)
    verify_module = module_from_spec(spec)
    spec.loader.exec_module(verify_module)

    # Extract phrases based on file type
    if source_info['type'] == 'markdown':
        phrases = verify_module.extract_phrases_from_markdown(source_file)
    elif source_info['type'] == 'audio_script':
        phrases = verify_module.extract_phrases_from_audio_script(source_file)
    elif source_info['type'] == 'json':
        phrases = verify_module.extract_phrases_from_json(source_file)
    else:
        result['steps'].append(f"Unknown source type: {source_info['type']}")
        return result

    if not phrases:
        result['steps'].append('No phrases extracted from source')
        return result

    print(f"Extracted {len(phrases)} phrases from source")
    result['steps'].append(f'Extracted {len(phrases)} phrases')

    # Create audio script with proper voice detection
    script_file = create_audio_script(phrases, resource_id, temp_dir)
    print(f"Created audio script: {script_file.name}")
    result['steps'].append('Created audio script with language detection')

    # Generate audio
    output_file = output_audio_dir / f'resource-{resource_id}.mp3'
    if generate_audio_from_script(script_file, output_file):
        result['steps'].append('Generated audio file')

        # Verify generated audio
        verification = verify_generated_audio(output_file, expected_phrases)

        if verification['success']:
            print(f"✓ Verification passed: {verification}")
            result['steps'].append('Verification passed')
            result['success'] = True
            result['verification'] = verification
        else:
            print(f"✗ Verification failed: {verification.get('reason', 'Unknown')}")
            result['steps'].append(f"Verification failed: {verification.get('reason')}")
    else:
        result['steps'].append('Audio generation failed')

    return result

def main():
    """Main systematic fix process"""

    project_root = Path(__file__).parent.parent

    # Load source truth
    source_truth_file = project_root / 'source-truth.json'
    if not source_truth_file.exists():
        print("Error: source-truth.json not found")
        print("Run verify-source-truth.py first")
        sys.exit(1)

    with open(source_truth_file, 'r', encoding='utf-8') as f:
        source_truth = json.load(f)

    # Load deployment verification
    deploy_verify_file = project_root / 'deployed-verification.json'
    deploy_verification = {}
    if deploy_verify_file.exists():
        with open(deploy_verify_file, 'r', encoding='utf-8') as f:
            deploy_verification = json.load(f)

    # Create temporary directory
    temp_dir = project_root / 'temp-audio-scripts'
    temp_dir.mkdir(exist_ok=True)

    # Output directory for fixed audio
    output_audio_dir = project_root / 'public' / 'audio'
    output_audio_dir.mkdir(parents=True, exist_ok=True)

    # Process all resources
    results = []

    print("Starting systematic audio regeneration...")
    print("=" * 70)

    for resource_id in range(1, 57):
        resource_id_str = str(resource_id)

        source_info = source_truth.get(resource_id_str, {})
        deploy_info = deploy_verification.get(resource_id_str)

        result = fix_resource(
            resource_id,
            source_info,
            deploy_info,
            temp_dir,
            output_audio_dir
        )

        results.append(result)

        # Small delay between resources
        time.sleep(1)

    # Save results
    results_file = project_root / 'systematic-fix-results.json'
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)

    print("\n" + "=" * 70)
    print(f"\nSystematic fix completed")
    print(f"Results saved to: {results_file}")

    # Statistics
    total = len(results)
    successful = sum(1 for r in results if r['success'])
    failed = total - successful

    print(f"\nSummary:")
    print(f"  Total resources: {total}")
    print(f"  Successfully fixed: {successful}")
    print(f"  Failed: {failed}")

    # Show failures
    failures = [r for r in results if not r['success']]
    if failures:
        print(f"\nFailed resources:")
        for failure in failures:
            print(f"  Resource {failure['resource_id']}:")
            for step in failure['steps']:
                print(f"    - {step}")

if __name__ == '__main__':
    main()
