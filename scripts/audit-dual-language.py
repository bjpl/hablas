#!/usr/bin/env python3
"""
Comprehensive audit of all 59 phrase scripts for dual-language content.
Verifies each script has both English and Spanish phrases.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple

# Spanish indicators: accented characters, Spanish-only words
SPANISH_PATTERNS = [
    r'[áéíóúñ¿¡]',  # Spanish accents and punctuation
    r'\b(de|el|la|los|las|un|una|para|por|con|en|está|qué|cómo|cuánto|dónde|puede|quiero|necesito|tengo|hay|me|te|se|gracias|por favor|disculpe|buenos|buenas|días|tardes|noches)\b',
]

def is_spanish_line(line: str) -> bool:
    """Check if line contains Spanish indicators."""
    line_lower = line.lower()
    for pattern in SPANISH_PATTERNS:
        if re.search(pattern, line_lower):
            return True
    return False

def is_english_line(line: str) -> bool:
    """Check if line contains English words (not Spanish)."""
    # If it has letters but no Spanish indicators, likely English
    if re.search(r'[a-zA-Z]', line) and not is_spanish_line(line):
        return True
    return False

def analyze_script(file_path: Path) -> Dict:
    """Analyze a single script file for language content."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        return {
            'error': str(e),
            'english_count': 0,
            'spanish_count': 0,
            'empty_count': 0,
            'total_lines': 0,
            'english_lines': [],
            'spanish_lines': [],
            'sample_content': []
        }

    english_lines = []
    spanish_lines = []
    empty_count = 0

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        if not stripped:
            empty_count += 1
        elif is_spanish_line(stripped):
            spanish_lines.append((i, stripped))
        elif is_english_line(stripped):
            english_lines.append((i, stripped))

    # Get sample content (first 20 lines for problematic scripts)
    sample_content = []
    for i, line in enumerate(lines[:20], 1):
        lang = 'EMPTY' if not line.strip() else ('SPANISH' if is_spanish_line(line.strip()) else 'ENGLISH')
        sample_content.append(f"Line {i:2d}: [{lang:7s}] {line.rstrip()}")

    return {
        'english_count': len(english_lines),
        'spanish_count': len(spanish_lines),
        'empty_count': empty_count,
        'total_lines': len(lines),
        'english_lines': english_lines,
        'spanish_lines': spanish_lines,
        'sample_content': sample_content,
        'error': None
    }

def categorize_script(analysis: Dict) -> Tuple[str, str]:
    """Categorize script quality and return status emoji and message."""
    eng = analysis['english_count']
    spa = analysis['spanish_count']

    if analysis['error']:
        return '❌', f"ERROR: {analysis['error']}"

    if eng == 0 and spa == 0:
        return '❌', "EMPTY - No content detected"

    if eng == 0:
        return '❌', "MISSING ENGLISH - Only Spanish detected"

    if spa == 0:
        return '❌', "MISSING SPANISH - Only English detected"

    # Calculate ratio
    ratio = eng / spa if spa > 0 else float('inf')

    if 0.8 <= ratio <= 1.2:  # Within 20% of 1:1
        return '✅', f"GOOD - Balanced ({eng}:{spa})"
    elif 0.5 <= ratio <= 2.0:  # Within 2x of 1:1
        return '⚠️', f"IMBALANCED - Ratio {eng}:{spa}"
    else:
        return '❌', f"SEVERELY IMBALANCED - Ratio {eng}:{spa}"

def main():
    scripts_dir = Path('C:/Users/brand/Development/Project_Workspace/active-development/hablas/scripts/final-phrases-only')

    if not scripts_dir.exists():
        print(f"❌ ERROR: Directory not found: {scripts_dir}")
        return

    # Find all resource files
    resource_files = sorted(scripts_dir.glob('resource-*.txt'))

    if not resource_files:
        print(f"❌ ERROR: No resource-*.txt files found in {scripts_dir}")
        return

    print("=" * 80)
    print("DUAL-LANGUAGE AUDIO SCRIPT AUDIT")
    print("=" * 80)
    print(f"Total files found: {len(resource_files)}")
    print(f"Expected: 59 files")
    print()

    # Analyze all scripts
    results = {}
    for file_path in resource_files:
        resource_num = file_path.stem.replace('resource-', '')
        results[resource_num] = analyze_script(file_path)

    # Summary statistics
    good_scripts = []
    warning_scripts = []
    bad_scripts = []

    print("=" * 80)
    print("QUICK SUMMARY BY RESOURCE")
    print("=" * 80)

    for resource_num in sorted(results.keys(), key=lambda x: int(x)):
        analysis = results[resource_num]
        status, message = categorize_script(analysis)

        print(f"Resource {resource_num:2s}: {status} {message}")

        if status == '✅':
            good_scripts.append(resource_num)
        elif status == '⚠️':
            warning_scripts.append(resource_num)
        else:
            bad_scripts.append(resource_num)

    print()
    print("=" * 80)
    print("OVERALL STATISTICS")
    print("=" * 80)
    print(f"✅ Good (balanced):     {len(good_scripts):2d} / {len(results)}")
    print(f"⚠️  Warning (imbalanced): {len(warning_scripts):2d} / {len(results)}")
    print(f"❌ Bad (missing lang):  {len(bad_scripts):2d} / {len(results)}")
    print()

    # Detailed report for problematic scripts
    if warning_scripts or bad_scripts:
        print("=" * 80)
        print("DETAILED REPORT - SCRIPTS NEEDING ATTENTION")
        print("=" * 80)
        print()

        problematic = sorted(warning_scripts + bad_scripts, key=lambda x: int(x))

        for resource_num in problematic:
            analysis = results[resource_num]
            status, message = categorize_script(analysis)

            print(f"{'=' * 80}")
            print(f"Resource {resource_num}: {status} {message}")
            print(f"{'=' * 80}")
            print(f"English phrases: {analysis['english_count']}")
            print(f"Spanish phrases: {analysis['spanish_count']}")
            print(f"Empty lines:     {analysis['empty_count']}")
            print(f"Total lines:     {analysis['total_lines']}")
            print()

            if analysis['spanish_count'] == 0:
                print("❌ CRITICAL: No Spanish translations found!")
                print("   ACTION REQUIRED: Add Spanish translations for all English phrases")
            elif analysis['english_count'] == 0:
                print("❌ CRITICAL: No English phrases found!")
                print("   ACTION REQUIRED: Add English phrases for all Spanish translations")
            else:
                eng_count = analysis['english_count']
                spa_count = analysis['spanish_count']
                if eng_count > spa_count:
                    print(f"⚠️  WARNING: More English ({eng_count}) than Spanish ({spa_count})")
                    print(f"   ACTION REQUIRED: Add {eng_count - spa_count} Spanish translations")
                else:
                    print(f"⚠️  WARNING: More Spanish ({spa_count}) than English ({eng_count})")
                    print(f"   ACTION REQUIRED: Add {spa_count - eng_count} English phrases")

            print()
            print("Sample content (first 20 lines):")
            print("-" * 80)
            for line in analysis['sample_content']:
                print(line)
            print()

    # Summary recommendations
    print("=" * 80)
    print("RECOMMENDATIONS")
    print("=" * 80)

    if len(bad_scripts) > 0:
        print(f"🔴 CRITICAL: {len(bad_scripts)} scripts missing entire language")
        print(f"   Resources needing immediate attention: {', '.join(sorted(bad_scripts, key=lambda x: int(x)))}")
        print()

    if len(warning_scripts) > 0:
        print(f"🟡 WARNING: {len(warning_scripts)} scripts with imbalanced content")
        print(f"   Resources needing review: {', '.join(sorted(warning_scripts, key=lambda x: int(x)))}")
        print()

    if len(good_scripts) == len(results):
        print("🎉 EXCELLENT: All scripts have balanced dual-language content!")
    else:
        print(f"✅ {len(good_scripts)} scripts are correctly balanced")
        print(f"⚠️  {len(warning_scripts) + len(bad_scripts)} scripts need fixes")
        print()
        print("NEXT STEPS:")
        print("1. Review detailed reports above for each problematic script")
        print("2. Add missing translations (English or Spanish)")
        print("3. Ensure proper formatting: 2 English lines, 1 Spanish line, 2 blank lines")
        print("4. Re-run this audit after fixes to verify")
        print("5. Regenerate audio files with: python scripts/generate-all-audio.py")

    print("=" * 80)

if __name__ == '__main__':
    main()
