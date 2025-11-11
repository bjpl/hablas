#!/usr/bin/env python3
"""
Quick test for resource type detection
"""

import json
from pathlib import Path


def detect_resource_type(resource_id: str, title: str) -> str:
    """
    Detect resource type based on ID and title to apply appropriate audio format.
    """
    title_lower = title.lower()

    # Check for conversation/dialogue indicators
    if any(word in title_lower for word in ['conversation', 'conversaciones', 'smalltalk',
                                             'small talk', 'dialogue', 'diálogo', 'diálogos']):
        return 'conversation'

    # Check for directions/navigation indicators
    if any(word in title_lower for word in ['direction', 'direcciones', 'navigation',
                                             'navegación', 'gps', 'números']):
        return 'directions'

    # Check for emergency indicators
    if any(word in title_lower for word in ['emergency', 'emergencia', 'safety',
                                             'seguridad', 'protocolo', 'accident']):
        return 'emergency'

    # Default to basic phrases
    return 'basic_phrases'


def main():
    """Test type detection on actual resources."""
    print("\n" + "="*80)
    print("RESOURCE TYPE DETECTION TEST")
    print("="*80)

    # Load master mapping
    mapping_file = Path(__file__).parent.parent / "resource-full-paths.json"
    with open(mapping_file, 'r', encoding='utf-8') as f:
        mapping = json.load(f)

    # Test specific resources
    test_ids = ["1", "10", "12", "27", "15", "22", "28", "33"]

    type_counts = {
        'conversation': [],
        'directions': [],
        'emergency': [],
        'basic_phrases': []
    }

    print("\nDETECTED TYPES:\n")
    for resource_id in sorted(mapping.keys(), key=int):
        resource_data = mapping[resource_id]
        title = resource_data.get('title', '')
        detected_type = detect_resource_type(resource_id, title)

        type_counts[detected_type].append(resource_id)

        if resource_id in test_ids:
            print(f"🎯 Resource {resource_id:>2}: {detected_type:>15} | {title[:50]}")

    # Summary
    print("\n" + "="*80)
    print("TYPE DISTRIBUTION SUMMARY")
    print("="*80)

    for type_name, ids in type_counts.items():
        print(f"{type_name:>15}: {len(ids):>2} resources - IDs: {', '.join(ids[:10])}")
        if len(ids) > 10:
            print(f"{' '*18}   ... and {len(ids) - 10} more")

    print("\n" + "="*80)
    print("✅ TYPE DETECTION TEST COMPLETE")
    print("="*80)


if __name__ == "__main__":
    main()
