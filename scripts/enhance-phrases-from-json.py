#!/usr/bin/env python3
"""
Enhance phrase extraction by also pulling from original JSON files.
This supplements the markdown extraction for better coverage.
"""

import json
import re
from pathlib import Path

# JSON source mapping
JSON_MAPPING = {
    38: "data/resources/avanzado/cross-cultural-communication.json",
    39: "data/resources/avanzado/customer-service-excellence.json",
    40: "data/resources/avanzado/earnings-optimization.json",
    41: "data/resources/avanzado/negotiation-skills.json",
    42: "data/resources/avanzado/professional-boundaries.json",
    43: "data/resources/avanzado/professional-communication.json",
    44: "data/resources/avanzado/time-management.json",
    45: "data/resources/emergency/accident-procedures.json",
    46: "data/resources/emergency/customer-conflict.json",
    47: "data/resources/emergency/lost-or-found-items.json",
    48: "data/resources/emergency/medical-emergencies.json",
    49: "data/resources/emergency/payment-disputes.json",
    50: "data/resources/emergency/safety-concerns.json",
    51: "data/resources/emergency/vehicle-breakdown.json",
    52: "data/resources/emergency/weather-hazards.json",
    53: "data/resources/app-specific/airport-rideshare.json",
    54: "data/resources/app-specific/doordash-delivery.json",
    55: "data/resources/app-specific/lyft-driver-essentials.json",
    56: "data/resources/app-specific/multi-app-strategy.json",
    57: "data/resources/app-specific/platform-ratings-mastery.json",
    58: "data/resources/app-specific/tax-and-expenses.json",
    59: "data/resources/app-specific/uber-driver-essentials.json",
}


def extract_from_json(json_path):
    """Extract English-Spanish phrase pairs from JSON resource files."""
    phrases = []

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"  Error reading JSON: {e}")
        return phrases

    # Extract from vocabulary/criticalVocabulary/platformVocabulary arrays
    vocab_keys = ['vocabulary', 'criticalVocabulary', 'platformVocabulary']
    for key in vocab_keys:
        if key in data:
            for item in data[key]:
                if 'english' in item and 'spanish' in item:
                    eng = item['english'].strip()
                    spa = item['spanish'].strip()
                    if eng and spa:
                        phrases.append((eng, spa))

    # Extract from phrases array
    if 'phrases' in data:
        for item in data['phrases']:
            if 'english' in item and 'spanish' in item:
                eng = item['english'].strip()
                spa = item['spanish'].strip()
                if eng and spa:
                    phrases.append((eng, spa))

    # Extract from emergencyPhrases array
    if 'emergencyPhrases' in data:
        for item in data['emergencyPhrases']:
            if 'english' in item and 'spanish' in item:
                eng = item['english'].strip()
                spa = item['spanish'].strip()
                # Prioritize CRITICAL and HIGH priority
                if eng and spa:
                    phrases.append((eng, spa))

    # Extract from stepByStepProtocol
    if 'stepByStepProtocol' in data:
        for step in data['stepByStepProtocol']:
            if 'action' in step and 'spanish' in step:
                eng = step['action'].strip()
                spa = step['spanish'].strip()
                if eng and spa:
                    # Add step number for clarity
                    step_num = step.get('step', '')
                    if step_num:
                        eng = f"Step {step_num}: {eng}"
                        spa = f"Paso {step_num}: {spa}"
                    phrases.append((eng, spa))

    # Extract from practicalScenarios
    if 'practicalScenarios' in data:
        for scenario in data['practicalScenarios']:
            if 'englishTranslation' in scenario and 'spanishResponse' in scenario:
                eng = scenario['englishTranslation'].strip()
                spa = scenario['spanishResponse'].strip()
                if eng and spa:
                    phrases.append((eng, spa))

    print(f"  Extracted {len(phrases)} phrases from JSON")
    return phrases


def format_for_audio(phrases):
    """Format phrases in dual-voice audio script format."""
    output = []

    for english, spanish in phrases:
        # Format: English\n\nEnglish\n\nSpanish\n\n\n
        output.append(english)
        output.append("")
        output.append(english)
        output.append("")
        output.append(spanish)
        output.append("")
        output.append("")

    return "\n".join(output)


def enhance_resource(resource_id, json_path, output_dir, min_phrases=10):
    """Enhance existing phrase file with JSON data if needed."""
    output_file = output_dir / f"resource-{resource_id}.txt"

    # Check current phrase count
    if output_file.exists():
        with open(output_file, 'r', encoding='utf-8') as f:
            content = f.read()
        current_count = content.count('\n\n\n') + 1  # Count separators

        if current_count >= min_phrases:
            print(f"Resource {resource_id}: Already has {current_count} phrases, skipping")
            return current_count

        print(f"Resource {resource_id}: Has {current_count} phrases, needs enhancement")

    else:
        print(f"Resource {resource_id}: File not found, creating new")
        current_count = 0

    # Extract from JSON
    json_full_path = Path(__file__).parent.parent / json_path
    if not json_full_path.exists():
        print(f"  WARNING: JSON not found: {json_path}")
        return current_count

    json_phrases = extract_from_json(json_full_path)

    if not json_phrases:
        print(f"  WARNING: No phrases extracted from JSON")
        return current_count

    # Limit to top phrases
    if len(json_phrases) > 15:
        # Prefer shorter phrases
        json_phrases.sort(key=lambda x: len(x[0]) + len(x[1]))
        json_phrases = json_phrases[:15]

    # Format and write
    script = format_for_audio(json_phrases)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(script)

    new_count = len(json_phrases)
    print(f"  ✓ Updated with {new_count} phrases from JSON")
    return new_count


def main():
    """Enhance all resources that need more phrases."""
    base_dir = Path(__file__).parent.parent
    output_dir = base_dir / "scripts" / "final-phrases-only"

    print("=" * 60)
    print("Enhancing Phrase Files from JSON Sources")
    print("=" * 60)
    print()

    stats = {
        'enhanced': 0,
        'skipped': 0,
        'total_phrases': 0
    }

    # Process resources that need enhancement
    for resource_id in sorted(JSON_MAPPING.keys()):
        json_path = JSON_MAPPING[resource_id]
        phrase_count = enhance_resource(resource_id, json_path, output_dir, min_phrases=8)

        if phrase_count >= 8:
            stats['enhanced'] += 1
        else:
            stats['skipped'] += 1

        stats['total_phrases'] += phrase_count
        print()

    # Summary
    print("=" * 60)
    print("ENHANCEMENT COMPLETE")
    print("=" * 60)
    print(f"Resources enhanced: {stats['enhanced']}")
    print(f"Resources skipped: {stats['skipped']}")
    print(f"Total phrases: {stats['total_phrases']}")
    print(f"Average: {stats['total_phrases'] / max(len(JSON_MAPPING), 1):.1f} per resource")


if __name__ == "__main__":
    main()
