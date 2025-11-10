#!/usr/bin/env python3
"""
Single Resource Regeneration Script
Use for fixing individual resources or testing
"""

import argparse
import sys
from pathlib import Path

# Import from master script
sys.path.insert(0, str(Path(__file__).parent))
from regenerate_all_resources_final import (
    regenerate_single_resource,
    log_message,
    texttospeech
)


def main():
    parser = argparse.ArgumentParser(description='Regenerate audio for a single resource')
    parser.add_argument('--resource-id', type=int, required=True, help='Resource ID to regenerate')
    parser.add_argument('--verify-only', action='store_true', help='Only verify, do not regenerate')

    args = parser.parse_args()

    log_message("="*60)
    log_message(f"🔧 SINGLE RESOURCE REGENERATION")
    log_message(f"📋 Resource ID: {args.resource_id}")
    log_message("="*60)

    if args.verify_only:
        log_message("🔍 Verification mode only")
        from regenerate_all_resources_final import verify_output
        result = verify_output(args.resource_id)
        if result:
            log_message(f"✅ Resource {args.resource_id} verification PASSED")
        else:
            log_message(f"❌ Resource {args.resource_id} verification FAILED")
        return

    # Initialize client
    try:
        client = texttospeech.TextToSpeechClient()
        log_message("✅ Google Cloud TTS client initialized")
    except Exception as e:
        log_message(f"❌ Failed to initialize TTS client: {e}")
        return

    # Regenerate
    result = regenerate_single_resource(args.resource_id, client)

    if result:
        log_message(f"\n✅ Successfully regenerated resource {args.resource_id}")
    else:
        log_message(f"\n❌ Failed to regenerate resource {args.resource_id}")
        sys.exit(1)


if __name__ == "__main__":
    main()
