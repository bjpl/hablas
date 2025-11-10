#!/usr/bin/env python3
"""
Direct Audio Regeneration - Use existing phrase scripts
Regenerates audio for incomplete resources using edge-tts
"""

import os
import subprocess
import sys
import time
from datetime import datetime

# Resources that need regeneration
INCOMPLETE_RESOURCES = [22, 23, 25, 29, 30, 31, 33]

def generate_audio_from_script(resource_id: int) -> bool:
    """Generate audio from existing phrase script"""

    script_path = f"scripts/final-phrases-only/resource-{resource_id}.txt"
    output_path = f"out/audio/resource-{resource_id}.mp3"

    # Check if script exists
    if not os.path.exists(script_path):
        print(f"  ✗ Script not found: {script_path}")
        return False

    # Read script
    try:
        with open(script_path, 'r', encoding='utf-8') as f:
            script_text = f.read()

        if not script_text.strip():
            print(f"  ✗ Script is empty: {script_path}")
            return False

        print(f"  Script loaded: {len(script_text)} chars, {len(script_text.splitlines())} lines")

        # Generate audio using edge-tts
        cmd = [
            'edge-tts',
            '--voice', 'es-MX-DaliaNeural',
            '--text', script_text,
            '--write-media', output_path
        ]

        print(f"  Generating audio...")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

        if result.returncode == 0:
            # Check file size
            file_size = os.path.getsize(output_path)
            file_size_mb = file_size / (1024 * 1024)
            print(f"  ✓ Audio generated: {file_size_mb:.2f} MB")

            # Copy to public/audio
            public_path = f"public/audio/resource-{resource_id}.mp3"
            os.makedirs('public/audio', exist_ok=True)
            subprocess.run(['cp', output_path, public_path], check=True)
            print(f"  ✓ Copied to: {public_path}")

            return True
        else:
            print(f"  ✗ Generation failed: {result.stderr}")
            return False

    except subprocess.TimeoutExpired:
        print(f"  ✗ Generation timeout (>300s)")
        return False
    except Exception as e:
        print(f"  ✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Regenerate all incomplete resources"""

    print("=" * 70)
    print("DIRECT AUDIO REGENERATION")
    print("=" * 70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    results = {'success': [], 'failed': []}
    total_start = time.time()

    for idx, resource_id in enumerate(INCOMPLETE_RESOURCES, 1):
        print(f"\n[{idx}/{len(INCOMPLETE_RESOURCES)}] Resource {resource_id}")
        print("-" * 70)

        if generate_audio_from_script(resource_id):
            results['success'].append(resource_id)
            print(f"  ✓ SUCCESS")
        else:
            results['failed'].append(resource_id)
            print(f"  ✗ FAILED")

        # Small delay between generations
        if idx < len(INCOMPLETE_RESOURCES):
            time.sleep(2)

    # Summary
    total_time = time.time() - total_start

    print("\n" + "=" * 70)
    print("REGENERATION COMPLETE")
    print("=" * 70)
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total Time: {total_time/60:.1f} minutes")
    print(f"Success: {len(results['success'])}/{len(INCOMPLETE_RESOURCES)}")

    if results['success']:
        print(f"\n✓ Success: {', '.join(map(str, results['success']))}")

    if results['failed']:
        print(f"\n✗ Failed: {', '.join(map(str, results['failed']))}")
        return 1

    print("\n✓ All audio files regenerated successfully!")
    print("\nNext steps:")
    print("1. Verify audio files in out/audio/ and public/audio/")
    print("2. Update service worker cache version if needed")
    print("3. Run: npm run build")
    print("4. Test audio playback")

    return 0

if __name__ == "__main__":
    sys.exit(main())
