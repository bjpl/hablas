#!/usr/bin/env python3
"""Test extraction on Resource 1 only"""

import sys
import json
import re
from pathlib import Path
from typing import List, Tuple

def extract_phrases_from_markdown(file_path: Path) -> List[Tuple[str, str]]:
    """Extract English/Spanish phrase pairs from markdown."""
    phrases = []

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find all "### Frase" sections
        sections = re.split(r'^### Frase \d+:', content, flags=re.MULTILINE)

        print(f"Found {len(sections) - 1} sections")

        for i, section in enumerate(sections[1:], 1):  # Skip first empty section
            # Pattern 1: **English**: "phrase text"
            en_match = re.search(r'\*\*English\*\*:\s*"([^"]+)"', section)

            # Pattern 2: 🗣️ **Español**: phrase text (without quotes)
            es_match = re.search(r'🗣️\s*\*\*Español\*\*:\s*([^\n│]+)', section)

            # Fallback: **Español**: phrase text
            if not es_match:
                es_match = re.search(r'\*\*Español\*\*:\s*([^\n│]+)', section)

            if en_match and es_match:
                english = en_match.group(1).strip()
                spanish = es_match.group(1).strip()

                # Clean up Spanish text (remove trailing periods, pronunciation guides)
                spanish = re.sub(r'\s*\[.*?\]\s*', '', spanish)  # Remove [pronunciation]
                spanish = spanish.strip('.').strip()

                print(f"Phrase {i}:")
                print(f"  EN: {english}")
                print(f"  ES: {spanish}")
                print()

                phrases.append((english, spanish))
            else:
                print(f"Section {i}: No match")
                if en_match:
                    print(f"  EN: {en_match.group(1)}")
                if es_match:
                    print(f"  ES: {es_match.group(1)}")
                print()

        return phrases

    except Exception as e:
        print(f"ERROR: {e}")
        return []


# Test on Resource 1
source_file = Path("generated-resources/50-batch/repartidor/basic_phrases_1.md")

print("="*60)
print("Testing extraction on Resource 1")
print(f"Source: {source_file}")
print("="*60)
print()

phrases = extract_phrases_from_markdown(source_file)

print("="*60)
print(f"RESULT: Extracted {len(phrases)} phrase pairs")
print("="*60)

if len(phrases) == 30:
    print("✅ SUCCESS: Got expected 30 phrases!")
else:
    print(f"❌ FAIL: Expected 30 phrases, got {len(phrases)}")
