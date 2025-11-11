#!/usr/bin/env python3
"""
Deployed Audio Verification - Check what's ACTUALLY live on the site
Downloads and analyzes deployed audio files from GitHub Pages
"""
import json
import os
import sys
import urllib.request
from pathlib import Path
from typing import Dict, Any, Optional
import subprocess

def download_deployed_audio(resource_id: int, output_dir: Path) -> Optional[Path]:
    """Download audio file from GitHub Pages"""

    url = f"https://bjpl.github.io/hablas/audio/resource-{resource_id}.mp3"
    output_file = output_dir / f"resource-{resource_id}.mp3"

    try:
        print(f"  Downloading from {url}...")
        urllib.request.urlretrieve(url, output_file)
        return output_file
    except Exception as e:
        print(f"  ✗ Download failed: {e}")
        return None

def get_file_size_mb(file_path: Path) -> float:
    """Get file size in MB"""
    size_bytes = file_path.stat().st_size
    return size_bytes / (1024 * 1024)

def estimate_phrases_from_size(size_mb: float) -> int:
    """
    Estimate phrase count from file size
    Based on observed data:
    - Simple phrase: ~50-100 KB
    - Average phrase: ~100-150 KB
    - Complex phrase: ~150-200 KB
    """
    # Conservative estimate: 100 KB per phrase average
    kb_per_phrase = 100
    size_kb = size_mb * 1024
    return int(size_kb / kb_per_phrase)

def analyze_audio_duration(file_path: Path) -> Optional[float]:
    """Get audio duration in seconds using ffprobe if available"""
    try:
        result = subprocess.run(
            ['ffprobe', '-v', 'error', '-show_entries',
             'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1',
             str(file_path)],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            return float(result.stdout.strip())
    except (subprocess.TimeoutExpired, subprocess.SubprocessError, FileNotFoundError):
        pass
    return None

def estimate_phrases_from_duration(duration_seconds: float) -> int:
    """
    Estimate phrases from duration
    Average phrase takes ~5-8 seconds (including pauses)
    """
    seconds_per_phrase = 6.5  # Average
    return int(duration_seconds / seconds_per_phrase)

def verify_specific_phrases(resource_id: int, audio_file: Path) -> Dict[str, Any]:
    """
    Verify known problematic phrases for specific resources
    These are test cases we know should pass
    """

    test_cases = {
        # Resource with delivery phrases
        2: {
            "phrases": [
                "Good morning! I have a delivery for you",
                "Solo recojo y entrego",
                "I'm outside, can you come out?"
            ],
            "expected_voices": {
                "Good morning! I have a delivery for you": "en-US",
                "Solo recojo y entrego": "es-MX",
                "I'm outside, can you come out?": "en-US"
            }
        },
        # Resource 1 with 30 phrases
        1: {
            "expected_count": 30
        },
        # Resource 4 with 23 phrases
        4: {
            "expected_count": 23
        }
    }

    if resource_id not in test_cases:
        return {}

    test_case = test_cases[resource_id]
    results = {
        "has_test_case": True,
        "test_details": test_case
    }

    # Note: Actual voice verification would require speech-to-text
    # For now, we flag these for manual verification
    results["manual_verification_needed"] = True

    return results

def verify_deployed_audio(source_truth_file: Path, output_dir: Path) -> Dict[str, Any]:
    """Verify all deployed audio files against source truth"""

    # Load source truth
    with open(source_truth_file, 'r', encoding='utf-8') as f:
        source_truth = json.load(f)

    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)

    verification_results = {}

    print("Verifying deployed audio files...")
    print("=" * 70)

    for resource_id_str, source_info in source_truth.items():
        resource_id = int(resource_id_str)
        expected_phrases = source_info['expected_phrases']

        print(f"\nResource {resource_id}:")
        print(f"  Expected phrases: {expected_phrases}")

        # Download deployed audio
        audio_file = download_deployed_audio(resource_id, output_dir)

        if not audio_file or not audio_file.exists():
            verification_results[resource_id_str] = {
                "status": "NOT_DEPLOYED",
                "expected_phrases": expected_phrases,
                "deployed_size": 0,
                "estimated_phrases": 0
            }
            continue

        # Analyze file
        size_mb = get_file_size_mb(audio_file)
        print(f"  Deployed size: {size_mb:.2f} MB")

        # Get duration if possible
        duration = analyze_audio_duration(audio_file)
        if duration:
            print(f"  Duration: {duration:.1f} seconds")
            estimated_phrases = estimate_phrases_from_duration(duration)
        else:
            estimated_phrases = estimate_phrases_from_size(size_mb)

        print(f"  Estimated phrases: {estimated_phrases}")

        # Compare with expected
        completeness_ratio = estimated_phrases / expected_phrases if expected_phrases > 0 else 0

        # Determine status
        if completeness_ratio >= 0.9:
            status = "LIKELY_COMPLETE"
        elif completeness_ratio >= 0.7:
            status = "POSSIBLY_INCOMPLETE"
        elif completeness_ratio >= 0.5:
            status = "MISSING_PHRASES"
        else:
            status = "SEVERELY_INCOMPLETE"

        print(f"  Status: {status} ({completeness_ratio:.1%})")

        # Check for specific test cases
        test_results = verify_specific_phrases(resource_id, audio_file)

        verification_results[resource_id_str] = {
            "status": status,
            "expected_phrases": expected_phrases,
            "deployed_size_mb": round(size_mb, 2),
            "estimated_phrases": estimated_phrases,
            "completeness_ratio": round(completeness_ratio, 2),
            "duration_seconds": round(duration, 1) if duration else None,
            **test_results
        }

    return verification_results

def main():
    """Main execution"""

    project_root = Path(__file__).parent.parent
    source_truth_file = project_root / 'source-truth.json'

    # Check if source truth exists
    if not source_truth_file.exists():
        print("Error: source-truth.json not found")
        print("Run verify-source-truth.py first")
        sys.exit(1)

    # Create temporary directory for downloaded files
    output_dir = project_root / 'temp-deployed-audio'

    try:
        # Verify deployed audio
        results = verify_deployed_audio(source_truth_file, output_dir)

        # Save results
        results_file = project_root / 'deployed-verification.json'
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2)

        print("\n" + "=" * 70)
        print(f"\nVerification results saved to: {results_file}")

        # Statistics
        total = len(results)
        by_status = {}
        for result in results.values():
            status = result['status']
            by_status[status] = by_status.get(status, 0) + 1

        print(f"\nDeployment Status Summary:")
        print(f"  Total resources: {total}")
        for status, count in sorted(by_status.items()):
            print(f"  {status}: {count}")

        # Flag issues
        issues = [
            rid for rid, result in results.items()
            if result['status'] in ['MISSING_PHRASES', 'SEVERELY_INCOMPLETE', 'NOT_DEPLOYED']
        ]

        if issues:
            print(f"\n⚠️  Resources with issues: {', '.join(issues)}")
            print(f"   These need regeneration")

        # Flag manual verification needed
        manual_check = [
            rid for rid, result in results.items()
            if result.get('manual_verification_needed')
        ]

        if manual_check:
            print(f"\n🔍 Resources needing manual voice verification: {', '.join(manual_check)}")

    finally:
        # Cleanup downloaded files
        if output_dir.exists():
            import shutil
            shutil.rmtree(output_dir)
            print(f"\nCleaned up temporary files")

if __name__ == '__main__':
    main()
