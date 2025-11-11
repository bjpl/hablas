#!/usr/bin/env python3
"""
Test script for adaptive audio format generation
Tests type detection and generates audio for specific resource types
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

# Import from regenerate script
from regenerate_from_source_complete import (
    detect_resource_type,
    load_master_mapping,
    regenerate_resource,
    log_message
)


async def test_type_detection():
    """Test resource type detection."""
    print("\n" + "="*60)
    print("TESTING TYPE DETECTION")
    print("="*60)

    test_cases = [
        ("1", "Frases Esenciales para Entregas - Var 1", "basic_phrases"),
        ("10", "Conversaciones con Clientes - Var 1", "conversation"),
        ("12", "Direcciones y Navegación GPS - Var 1", "directions"),
        ("27", "Frases de Emergencia - Var 1", "emergency"),
        ("15", "Small Talk con Pasajeros - Var 1", "conversation"),
        ("22", "Números y Direcciones - Var 1", "directions"),
    ]

    all_passed = True
    for resource_id, title, expected_type in test_cases:
        detected = detect_resource_type(resource_id, title)
        status = "✅" if detected == expected_type else "❌"
        print(f"{status} Resource {resource_id}: {title[:40]}...")
        print(f"   Expected: {expected_type}, Got: {detected}")

        if detected != expected_type:
            all_passed = False

    print("\n" + "="*60)
    if all_passed:
        print("✅ ALL TYPE DETECTION TESTS PASSED")
    else:
        print("❌ SOME TYPE DETECTION TESTS FAILED")
    print("="*60)

    return all_passed


async def test_audio_generation():
    """Test audio generation for different resource types."""
    print("\n" + "="*60)
    print("TESTING AUDIO GENERATION")
    print("="*60)

    # Load mapping
    mapping = load_master_mapping()
    if not mapping:
        print("❌ Cannot load master mapping")
        return False

    # Test one resource of each type
    test_resources = [
        "1",   # basic_phrases
        "10",  # conversation
        "12",  # directions
        "27",  # emergency
    ]

    results = []
    for resource_id in test_resources:
        print(f"\n{'─'*60}")
        success = await regenerate_resource(resource_id, mapping)
        results.append((resource_id, success))

    # Summary
    print("\n" + "="*60)
    print("AUDIO GENERATION SUMMARY")
    print("="*60)

    all_passed = True
    for resource_id, success in results:
        status = "✅" if success else "❌"
        resource_data = mapping.get(resource_id, {})
        title = resource_data.get('title', 'Unknown')
        resource_type = detect_resource_type(resource_id, title)
        print(f"{status} Resource {resource_id} ({resource_type}): {title[:40]}...")

        if not success:
            all_passed = False

    print("="*60)

    return all_passed


async def main():
    """Run all tests."""
    print("\n" + "="*80)
    print("🧪 ADAPTIVE AUDIO FORMAT TEST SUITE")
    print("="*80)

    # Test 1: Type detection
    detection_passed = await test_type_detection()

    # Test 2: Audio generation (only if detection passed)
    if detection_passed:
        generation_passed = await test_audio_generation()
    else:
        print("\n⚠️  Skipping audio generation tests due to detection failures")
        generation_passed = False

    # Final summary
    print("\n" + "="*80)
    print("FINAL TEST SUMMARY")
    print("="*80)
    print(f"Type Detection: {'✅ PASSED' if detection_passed else '❌ FAILED'}")
    print(f"Audio Generation: {'✅ PASSED' if generation_passed else '❌ FAILED'}")
    print("="*80)

    if detection_passed and generation_passed:
        print("\n🎉 ALL TESTS PASSED!")
        return 0
    else:
        print("\n❌ SOME TESTS FAILED")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
