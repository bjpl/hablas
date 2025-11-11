#!/usr/bin/env python3
"""
Source Truth Mapping - Extract ACTUAL phrase counts from all source files
Creates definitive mapping of resource ID → expected content
"""
import json
import os
import re
from pathlib import Path
from typing import Dict, List, Any

def extract_phrases_from_markdown(file_path: Path) -> List[str]:
    """Extract phrases from markdown format resource files"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    phrases = []
    # Look for phrase patterns in markdown
    # Common patterns: "- Spanish: ... | English: ..."
    # or bilingual dialogue blocks

    # Pattern 1: List items with Spanish/English
    list_pattern = r'-\s*(?:Spanish|Español):\s*([^\|]+)\s*\|\s*(?:English|Inglés):\s*([^\n]+)'
    matches = re.findall(list_pattern, content, re.IGNORECASE)
    for spanish, english in matches:
        phrases.append(spanish.strip())
        phrases.append(english.strip())

    # Pattern 2: Dialogue format
    dialogue_pattern = r'\*\*(?:Spanish|Español)\*\*:\s*([^\n]+)\n\*\*(?:English|Inglés)\*\*:\s*([^\n]+)'
    matches = re.findall(dialogue_pattern, content, re.IGNORECASE)
    for spanish, english in matches:
        phrases.append(spanish.strip())
        phrases.append(english.strip())

    # Pattern 3: Simple bilingual pairs
    pair_pattern = r'"([^"]+)"\s*-\s*"([^"]+)"'
    matches = re.findall(pair_pattern, content)
    for phrase1, phrase2 in matches:
        phrases.append(phrase1.strip())
        phrases.append(phrase2.strip())

    return [p for p in phrases if p and len(p) > 3]

def extract_phrases_from_audio_script(file_path: Path) -> List[str]:
    """Extract phrases from audio script txt files"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    phrases = []
    # Audio scripts have format: [voice_id] text
    pattern = r'\[(?:es-MX-Standard-A|en-US-Standard-C|en-US-Standard-D)\]\s*([^\n]+)'
    matches = re.findall(pattern, content)

    for phrase in matches:
        cleaned = phrase.strip().strip('"').strip("'")
        if cleaned and len(cleaned) > 3:
            phrases.append(cleaned)

    return phrases

def extract_phrases_from_json(file_path: Path) -> List[str]:
    """Extract phrases from JSON resource files"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    phrases = []

    # Extract from content sections
    if 'content' in data:
        content = data['content']

        # Check different content structures
        if isinstance(content, dict):
            # Look for phrases array
            if 'phrases' in content:
                phrases_data = content['phrases']
                if isinstance(phrases_data, list):
                    for item in phrases_data:
                        if isinstance(item, dict):
                            if 'spanish' in item:
                                phrases.append(item['spanish'])
                            if 'english' in item:
                                phrases.append(item['english'])
                        elif isinstance(item, str):
                            phrases.append(item)

            # Check dialogue sections
            if 'dialogue' in content:
                dialogue = content['dialogue']
                if isinstance(dialogue, list):
                    for exchange in dialogue:
                        if isinstance(exchange, dict):
                            if 'spanish' in exchange:
                                phrases.append(exchange['spanish'])
                            if 'english' in exchange:
                                phrases.append(exchange['english'])

            # Check vocabulary/scenarios
            for key in ['vocabulary', 'scenarios', 'examples']:
                if key in content and isinstance(content[key], list):
                    for item in content[key]:
                        if isinstance(item, dict):
                            if 'spanish' in item:
                                phrases.append(item['spanish'])
                            if 'english' in item:
                                phrases.append(item['english'])

    return [p for p in phrases if isinstance(p, str) and len(p) > 3]

def find_source_file(resource_id: int, project_root: Path) -> Dict[str, Any]:
    """Find the authoritative source file for a resource"""

    # Priority order of source files to check
    search_patterns = [
        # Generated resources (PRIMARY SOURCE)
        f"generated-resources/50-batch/**/*.md",
        f"public/generated-resources/50-batch/**/*.md",
        f"generated-resources/50-batch/**/*-audio-script.txt",
        f"public/generated-resources/50-batch/**/*-audio-script.txt",

        # Audio specs (most authoritative for audio)
        f"audio-specs/resource-{resource_id}-spec.json",

        # Phrase extraction files
        f"scripts/final-phrases-only/resource-{resource_id}.txt",
        f"scripts/final-phrases-only/resource-{resource_id}-complete.txt",

        # Markdown documentation
        f"docs/templates/**/resource-{resource_id}*.md",
        f"docs/templates/**/*{resource_id:02d}*.md",

        # JSON data files
        f"data/resources/resource-{resource_id}.json",
        f"data/resources.backup/**/resource-{resource_id}.json",

        # Numbered templates
        f"docs/templates/**/{resource_id:02d}-*.md",
    ]

    for pattern in search_patterns:
        matches = list(project_root.glob(pattern))
        if matches:
            source_file = matches[0]

            # Determine type and extract phrases
            if source_file.suffix == '.md':
                phrases = extract_phrases_from_markdown(source_file)
                source_type = 'markdown'
            elif source_file.suffix == '.txt':
                phrases = extract_phrases_from_audio_script(source_file)
                source_type = 'audio_script'
            elif source_file.suffix == '.json':
                phrases = extract_phrases_from_json(source_file)
                source_type = 'json'
            else:
                continue

            if phrases:
                return {
                    'source': str(source_file.relative_to(project_root)),
                    'expected_phrases': len(phrases),
                    'type': source_type,
                    'phrases': phrases
                }

    return None

def build_source_truth_map(project_root: Path) -> Dict[str, Any]:
    """Build complete source truth map for all 56 resources"""

    source_truth = {}

    print("Building source truth map from authoritative files...")
    print("=" * 70)

    for resource_id in range(1, 57):
        print(f"\nResource {resource_id}:")

        source_info = find_source_file(resource_id, project_root)

        if source_info:
            source_truth[str(resource_id)] = {
                'source': source_info['source'],
                'expected_phrases': source_info['expected_phrases'],
                'type': source_info['type']
            }
            print(f"  ✓ Found: {source_info['source']}")
            print(f"    Type: {source_info['type']}")
            print(f"    Phrases: {source_info['expected_phrases']}")

            # Show first few phrases as sample
            if source_info['phrases']:
                print(f"    Sample phrases:")
                for phrase in source_info['phrases'][:3]:
                    print(f"      - {phrase[:60]}...")
        else:
            print(f"  ✗ No source file found")
            source_truth[str(resource_id)] = {
                'source': 'MISSING',
                'expected_phrases': 0,
                'type': 'unknown'
            }

    return source_truth

def main():
    """Main execution"""

    project_root = Path(__file__).parent.parent

    # Build source truth map
    source_truth = build_source_truth_map(project_root)

    # Save to file
    output_file = project_root / 'source-truth.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(source_truth, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 70)
    print(f"\nSource truth map saved to: {output_file}")

    # Statistics
    total = len(source_truth)
    found = sum(1 for v in source_truth.values() if v['source'] != 'MISSING')
    total_phrases = sum(v['expected_phrases'] for v in source_truth.values())

    print(f"\nStatistics:")
    print(f"  Total resources: {total}")
    print(f"  Sources found: {found}")
    print(f"  Missing sources: {total - found}")
    print(f"  Total expected phrases: {total_phrases}")

    # Show resources by type
    by_type = {}
    for resource_id, info in source_truth.items():
        source_type = info['type']
        if source_type not in by_type:
            by_type[source_type] = []
        by_type[source_type].append(resource_id)

    print(f"\nResources by source type:")
    for source_type, resources in sorted(by_type.items()):
        print(f"  {source_type}: {len(resources)} resources")

    # Warn about missing sources
    missing = [rid for rid, info in source_truth.items() if info['source'] == 'MISSING']
    if missing:
        print(f"\n⚠️  Resources without source files: {', '.join(missing)}")

if __name__ == '__main__':
    main()
