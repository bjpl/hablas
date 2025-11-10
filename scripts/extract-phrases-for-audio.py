#!/usr/bin/env python3
"""
Extract key phrases from resources 38-59 for audio generation.
Reads converted markdown files and generates dual-voice audio scripts.

Output format matches existing cleaned scripts:
English phrase

Spanish translation


English phrase

Spanish translation
"""

import os
import re
import json
from pathlib import Path

# Resource ID to file path mapping
RESOURCE_MAPPING = {
    38: "docs/resources/converted/avanzado/cross-cultural-communication.md",
    39: "docs/resources/converted/avanzado/customer-service-excellence.md",
    40: "docs/resources/converted/avanzado/earnings-optimization.md",
    41: "docs/resources/converted/avanzado/negotiation-skills.md",
    42: "docs/resources/converted/avanzado/professional-boundaries.md",
    43: "docs/resources/converted/avanzado/professional-communication.md",
    44: "docs/resources/converted/avanzado/time-management.md",
    45: "docs/resources/converted/emergency/accident-procedures.md",
    46: "docs/resources/converted/emergency/customer-conflict.md",
    47: "docs/resources/converted/emergency/lost-or-found-items.md",
    48: "docs/resources/converted/emergency/medical-emergencies.md",
    49: "docs/resources/converted/emergency/payment-disputes.md",
    50: "docs/resources/converted/emergency/safety-concerns.md",
    51: "docs/resources/converted/emergency/vehicle-breakdown.md",
    52: "docs/resources/converted/emergency/weather-hazards.md",
    53: "docs/resources/converted/app-specific/airport-rideshare.md",
    54: "docs/resources/converted/app-specific/doordash-delivery.md",
    55: "docs/resources/converted/app-specific/lyft-driver-essentials.md",
    56: "docs/resources/converted/app-specific/multi-app-strategy.md",
    57: "docs/resources/converted/app-specific/platform-ratings-mastery.md",
    58: "docs/resources/converted/app-specific/tax-and-expenses.md",
    59: "docs/resources/converted/app-specific/uber-driver-essentials.md",
}


def extract_vocabulary_table(content):
    """Extract English-Spanish pairs from vocabulary markdown tables."""
    phrases = []

    # Match markdown table rows
    table_pattern = r'\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|'
    matches = re.findall(table_pattern, content)

    for match in matches:
        english = match[0].strip()
        spanish = match[1].strip()

        # Skip header rows and pronunciation columns
        if english.lower() in ['english', 'pronunciation', 'context', '']:
            continue
        if spanish.lower() in ['spanish', 'pronunciation', 'context', '']:
            continue
        if english.startswith('*') or spanish.startswith('*'):
            continue

        # Clean up asterisks and formatting
        english = re.sub(r'\*+', '', english).strip()
        spanish = re.sub(r'\*+', '', spanish).strip()

        if english and spanish and len(english) > 2 and len(spanish) > 2:
            phrases.append((english, spanish))

    return phrases


def extract_essential_phrases(content):
    """Extract English-Spanish phrase pairs from Essential Phrases sections."""
    phrases = []

    # Pattern to match phrase sections with headers
    # Looks for ### numbered items followed by English and Spanish
    section_pattern = r'###\s+\d+\.\s+([^\n]+)\n+\*\*Spanish:\*\*\s+([^\n]+)'
    matches = re.findall(section_pattern, content, re.MULTILINE)

    for match in matches:
        english = match[0].strip()
        spanish = match[1].strip()

        # Clean up
        english = re.sub(r'\*+', '', english).strip()
        spanish = re.sub(r'\*+', '', spanish).strip()

        if english and spanish:
            phrases.append((english, spanish))

    # Also look for simple **Spanish:** pattern
    simple_pattern = r'([^\n]+)\n+\*\*Spanish:\*\*\s+([^\n]+)'
    simple_matches = re.findall(simple_pattern, content)

    for match in simple_matches:
        english = match[0].strip()
        spanish = match[1].strip()

        # Skip if already captured
        if (english, spanish) in phrases:
            continue

        # Clean up headers and formatting
        english = re.sub(r'^#+\s*\d*\.?\s*', '', english)
        english = re.sub(r'\*+', '', english).strip()
        spanish = re.sub(r'\*+', '', spanish).strip()

        # Skip very long entries (likely descriptions)
        if len(english) > 100 or len(spanish) > 100:
            continue

        if english and spanish and not english.startswith('#'):
            phrases.append((english, spanish))

    return phrases


def extract_emergency_phrases(content):
    """Extract critical emergency phrases."""
    phrases = []

    # Look for CRITICAL or HIGH priority phrases
    priority_pattern = r'"english":\s*"([^"]+)"[^}]*"spanish":\s*"([^"]+)"[^}]*"priority":\s*"(CRITICAL|HIGH)"'
    matches = re.findall(priority_pattern, content)

    for match in matches:
        english = match[0].strip()
        spanish = match[1].strip()
        if english and spanish:
            phrases.append((english, spanish))

    return phrases


def select_top_phrases(phrases, max_count=15):
    """
    Select the most essential phrases, limiting to max_count.
    Prioritizes shorter, more practical phrases.
    """
    if len(phrases) <= max_count:
        return phrases

    # Score phrases - shorter is generally better for audio
    scored = []
    for eng, spa in phrases:
        # Prefer shorter phrases
        length_score = 100 - min(len(eng) + len(spa), 100)
        # Prefer phrases with common words
        common_words = ['I', 'you', 'please', 'thank', 'help', 'sorry', 'where', 'when', 'how']
        common_score = sum(10 for word in common_words if word.lower() in eng.lower())

        total_score = length_score + common_score
        scored.append((total_score, eng, spa))

    # Sort by score and take top phrases
    scored.sort(reverse=True, key=lambda x: x[0])
    return [(eng, spa) for score, eng, spa in scored[:max_count]]


def format_for_audio(phrases):
    """Format phrases in dual-voice audio script format."""
    output = []

    for english, spanish in phrases:
        # Format: English\n\nEnglish\n\nSpanish\n\n\n (extra blank line between phrases)
        output.append(english)
        output.append("")
        output.append(english)
        output.append("")
        output.append(spanish)
        output.append("")
        output.append("")

    return "\n".join(output)


def process_resource(resource_id, source_path, output_dir):
    """Process a single resource file and generate phrase script."""
    print(f"Processing resource {resource_id}: {source_path}")

    # Read source file
    full_path = Path(source_path)
    if not full_path.exists():
        print(f"  WARNING: Source file not found: {source_path}")
        return None

    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract phrases from different sections
    all_phrases = []

    # Vocabulary table
    vocab_phrases = extract_vocabulary_table(content)
    all_phrases.extend(vocab_phrases)
    print(f"  Found {len(vocab_phrases)} vocabulary phrases")

    # Essential phrases
    essential_phrases = extract_essential_phrases(content)
    all_phrases.extend(essential_phrases)
    print(f"  Found {len(essential_phrases)} essential phrases")

    # Emergency-specific phrases
    if 'emergency' in str(source_path):
        emergency_phrases = extract_emergency_phrases(content)
        all_phrases.extend(emergency_phrases)
        print(f"  Found {len(emergency_phrases)} emergency phrases")

    # Remove duplicates while preserving order
    seen = set()
    unique_phrases = []
    for phrase in all_phrases:
        key = (phrase[0].lower(), phrase[1].lower())
        if key not in seen:
            seen.add(key)
            unique_phrases.append(phrase)

    print(f"  Total unique phrases: {len(unique_phrases)}")

    # Select top phrases
    selected_phrases = select_top_phrases(unique_phrases, max_count=15)
    print(f"  Selected {len(selected_phrases)} phrases for audio")

    # Format for audio
    script = format_for_audio(selected_phrases)

    # Write output file
    output_file = output_dir / f"resource-{resource_id}.txt"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(script)

    print(f"  ✓ Created: {output_file}")
    return len(selected_phrases)


def main():
    """Process all resources 38-59."""
    # Base directory
    base_dir = Path(__file__).parent.parent
    output_dir = base_dir / "scripts" / "final-phrases-only"

    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("Phrase Extraction for Audio Generation")
    print("Resources 38-59")
    print("=" * 60)
    print()

    stats = {
        'processed': 0,
        'skipped': 0,
        'total_phrases': 0
    }

    # Process each resource
    for resource_id in sorted(RESOURCE_MAPPING.keys()):
        source_path = base_dir / RESOURCE_MAPPING[resource_id]

        phrase_count = process_resource(resource_id, source_path, output_dir)

        if phrase_count is not None:
            stats['processed'] += 1
            stats['total_phrases'] += phrase_count
        else:
            stats['skipped'] += 1

        print()

    # Final summary
    print("=" * 60)
    print("EXTRACTION COMPLETE")
    print("=" * 60)
    print(f"Resources processed: {stats['processed']}")
    print(f"Resources skipped: {stats['skipped']}")
    print(f"Total phrases extracted: {stats['total_phrases']}")
    print(f"Average phrases per resource: {stats['total_phrases'] / max(stats['processed'], 1):.1f}")
    print()
    print(f"Output directory: {output_dir}")
    print()

    # Verify all files exist
    print("Verifying all 59 resource files...")
    missing = []
    for i in range(1, 60):
        file_path = output_dir / f"resource-{i}.txt"
        if not file_path.exists():
            missing.append(i)

    if missing:
        print(f"WARNING: Missing resource files: {missing}")
    else:
        print("✓ All 59 resource phrase files exist!")


if __name__ == "__main__":
    main()
