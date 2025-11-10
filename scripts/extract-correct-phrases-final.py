#!/usr/bin/env python3
"""
Extract correct phrases from source files for all 59 resources
Handles both markdown and JSON formats with proper phrase extraction
"""
import json
import re
import os
from pathlib import Path
from typing import List, Dict, Tuple

# Base directory
BASE_DIR = Path(__file__).parent.parent

# Output directory
OUTPUT_DIR = BASE_DIR / "scripts" / "final-phrases-only"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def extract_from_markdown_box(content: str) -> List[Tuple[str, str]]:
    """Extract English/Spanish pairs from markdown box format"""
    phrases = []

    # Split into lines for easier parsing
    lines = content.split('\n')

    i = 0
    while i < len(lines):
        line = lines[i]

        # Look for English line
        if '│ **English**:' in line:
            # Extract English phrase (remove quotes if present)
            english_match = re.search(r'│\s*\*\*English\*\*:\s*["\']?([^"\'│]+?)["\']?\s*│', line)
            if english_match:
                english = english_match.group(1).strip()

                # Look ahead for Spanish line (within next 5 lines)
                for j in range(i+1, min(i+6, len(lines))):
                    spanish_line = lines[j]
                    if '🗣️ **Español**:' in spanish_line:
                        spanish_match = re.search(r'│\s*🗣️\s*\*\*Español\*\*:\s*([^│]+?)│', spanish_line)
                        if spanish_match:
                            spanish = spanish_match.group(1).strip()
                            if english and spanish:
                                phrases.append((english, spanish))
                            break
        i += 1

    return phrases

def extract_from_audio_script(content: str) -> List[Tuple[str, str]]:
    """Extract phrases from audio script format"""
    phrases = []

    # Look for English phrases spoken by Native speakers
    # Followed by Spanish translations from narrator
    lines = content.split('\n')
    i = 0

    while i < len(lines):
        line = lines[i].strip()

        # Look for English speaker markers
        if '**[Speaker: English' in line:
            # Look for the next quoted phrase
            for j in range(i+1, min(i+5, len(lines))):
                next_line = lines[j].strip()
                if '"' in next_line:
                    english_match = re.search(r'"([^"]+)"', next_line)
                    if english_match:
                        english = english_match.group(1).strip()

                        # Now look ahead for Spanish narrator translation
                        for k in range(j+1, min(j+15, len(lines))):
                            spanish_line = lines[k].strip()

                            # Look for Spanish narrator providing translation
                            if '**[Speaker: Spanish narrator]**' in spanish_line or \
                               '**[Speaker: Spanish - Instructional' in spanish_line:
                                # Skip to the actual translation line
                                for m in range(k+1, min(k+5, len(lines))):
                                    trans_line = lines[m].strip()
                                    if '"' in trans_line:
                                        spanish_match = re.search(r'"([^"]+)"', trans_line)
                                        if spanish_match:
                                            spanish = spanish_match.group(1).strip()
                                            # Make sure it's not instructional text
                                            if not spanish.startswith('Consejo:') and \
                                               not spanish.startswith('Frase ') and \
                                               (english, spanish) not in phrases:
                                                phrases.append((english, spanish))
                                            break
                                break
                        break
        i += 1

    return phrases

def extract_from_converted_md(content: str) -> List[Tuple[str, str]]:
    """Extract from converted markdown format (resources 38-59)"""
    phrases = []

    # Extract from vocabulary table
    table_pattern = r'\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*\*([^*]+)\*\s*\|'
    matches = re.findall(table_pattern, content, re.MULTILINE)

    for english, spanish, pronunciation in matches:
        english = english.strip()
        spanish = spanish.strip()
        if english and spanish and english.lower() not in ['english', 'vocabulary']:
            phrases.append((english, spanish))

    # Extract from Essential Phrases sections
    # Pattern: ### Number. English phrase
    # **Spanish:** translation
    section_pattern = r'###\s*\d+\.\s*([^\n]+)\n+\*\*Spanish:\*\*\s*([^\n]+)'
    section_matches = re.findall(section_pattern, content, re.MULTILINE)

    for english, spanish in section_matches:
        english = english.strip()
        spanish = spanish.strip()
        if english and spanish:
            phrases.append((english, spanish))

    # Extract from phrases in JSON blocks
    json_pattern = r'"english":\s*"([^"]+)",?\s*"spanish":\s*"([^"]+)"'
    json_matches = re.findall(json_pattern, content, re.MULTILINE)

    for english, spanish in json_matches:
        if (english, spanish) not in phrases:
            phrases.append((english, spanish))

    return phrases

def extract_phrases_from_file(filepath: Path, resource_id: int) -> List[Tuple[str, str]]:
    """Extract phrases based on file type"""
    if not filepath.exists():
        print(f"⚠️  File not found: {filepath}")
        return []

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    phrases = []

    # Normalize path for comparison (handle Windows backslashes)
    filepath_str = str(filepath).replace('\\', '/')

    # Determine extraction method based on file path
    if 'audio-script.txt' in filepath_str:
        phrases = extract_from_audio_script(content)
    elif ('generated-resources/50-batch' in filepath_str or
          'generated-resources\\50-batch' in str(filepath)) and filepath.suffix == '.md':
        phrases = extract_from_markdown_box(content)
    elif 'converted' in filepath_str and filepath.suffix == '.md':
        phrases = extract_from_converted_md(content)
    elif filepath.suffix == '.json':
        # Handle JSON files
        try:
            data = json.loads(content)
            if 'criticalVocabulary' in data:
                for item in data['criticalVocabulary']:
                    phrases.append((item['english'], item['spanish']))
            if 'phrases' in data:
                for item in data['phrases']:
                    phrases.append((item['english'], item['spanish']))
            if 'commonScenarios' in data:
                scenarios = data['commonScenarios']
                if isinstance(scenarios, dict) and 'phrases' in scenarios:
                    for item in scenarios['phrases']:
                        phrases.append((item['english'], item['spanish']))
        except json.JSONDecodeError:
            print(f"⚠️  Invalid JSON in {filepath}")

    return phrases

def format_phrases_for_audio(phrases: List[Tuple[str, str]], max_phrases: int = 20) -> str:
    """Format phrases in the required audio script format"""
    # Limit to most important phrases
    phrases = phrases[:max_phrases]

    lines = []
    for english, spanish in phrases:
        lines.append(english)
        lines.append("")  # blank line
        lines.append(english)
        lines.append("")  # blank line
        lines.append(spanish)
        lines.append("")  # blank line separator

    return '\n'.join(lines)

def load_resources_mapping() -> List[Dict]:
    """Load resource mappings from resources.ts"""
    resources_file = BASE_DIR / "data" / "resources.ts"

    with open(resources_file, 'r', encoding='utf-8') as f:
        content = f.read()

    resources = []

    # Parse manually - extract each resource block
    # Look for "id": number patterns
    resource_blocks = re.split(r'(?=\{[\s\n]*"id":)', content)

    for block in resource_blocks:
        # Extract id
        id_match = re.search(r'"id":\s*(\d+)', block)
        if not id_match:
            continue

        resource_id = int(id_match.group(1))

        # Extract title
        title_match = re.search(r'"title":\s*"([^"]+)"', block)
        title = title_match.group(1) if title_match else f"Resource {resource_id}"

        # Extract contentPath
        content_path_match = re.search(r'"contentPath":\s*"([^"]+)"', block)
        if not content_path_match:
            continue

        # Windows path - need to unescape backslashes
        content_path = content_path_match.group(1).replace('\\\\', '\\')

        resources.append({
            'id': resource_id,
            'title': title,
            'contentPath': content_path
        })

    # Sort by id
    resources.sort(key=lambda x: x['id'])

    return resources

def main():
    print("=" * 80)
    print("EXTRACTING CORRECT PHRASES FROM SOURCE FILES")
    print("=" * 80)
    print()

    # Load resources mapping
    print("Loading resource mappings...")
    resources = load_resources_mapping()
    print(f"Found {len(resources)} resources")
    print()

    stats = {
        'success': 0,
        'no_phrases': 0,
        'file_missing': 0
    }

    samples = {}

    for resource in resources:
        resource_id = resource['id']
        title = resource['title']
        content_path = resource.get('contentPath', '')

        if not content_path:
            print(f"⚠️  Resource {resource_id}: No contentPath defined")
            stats['file_missing'] += 1
            continue

        # Convert Windows path to Path object
        filepath = Path(content_path)

        print(f"Processing Resource {resource_id}: {title}")
        print(f"  Source: {filepath.name}")

        # Extract phrases
        phrases = extract_phrases_from_file(filepath, resource_id)

        if not phrases:
            print(f"  ⚠️  No phrases extracted")
            stats['no_phrases'] += 1
            continue

        print(f"  ✓ Extracted {len(phrases)} phrase pairs")

        # Format for audio
        audio_script = format_phrases_for_audio(phrases)

        # Save to file
        output_file = OUTPUT_DIR / f"resource-{resource_id}.txt"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(audio_script)

        print(f"  ✓ Saved to {output_file.name}")
        stats['success'] += 1

        # Store samples for verification (first 3 phrases)
        samples[resource_id] = {
            'title': title,
            'phrases': phrases[:3]
        }
        print()

    # Print summary
    print("=" * 80)
    print("EXTRACTION COMPLETE")
    print("=" * 80)
    print(f"✓ Successfully processed: {stats['success']} resources")
    print(f"⚠️  No phrases found: {stats['no_phrases']} resources")
    print(f"⚠️  File missing: {stats['file_missing']} resources")
    print()

    # Print verification samples
    print("=" * 80)
    print("VERIFICATION SAMPLES")
    print("=" * 80)
    print()

    # Key resources to verify
    verify_ids = [1, 5, 32, 45, 54]

    for res_id in verify_ids:
        if res_id in samples:
            sample = samples[res_id]
            print(f"Resource {res_id}: {sample['title']}")
            for i, (english, spanish) in enumerate(sample['phrases'], 1):
                print(f"  {i}. EN: {english}")
                print(f"     ES: {spanish}")
            print()

    print("✓ All phrase files saved to:", OUTPUT_DIR)
    print()
    print("NEXT STEPS:")
    print("1. Verify Resource 32 contains customer conversation phrases (not generic delivery)")
    print("2. Check samples above match expected content for each resource")
    print("3. Run audio generation with these corrected phrase files")

if __name__ == '__main__':
    main()
