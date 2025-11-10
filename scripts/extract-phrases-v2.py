#!/usr/bin/env python3
"""Extract phrases from manual - handles box format carefully"""

import re
from pathlib import Path

def clean_line(line):
    """Remove box characters and extra whitespace"""
    line = re.sub(r'[│└─┘┐┌]', '', line)
    return line.strip()

def extract_all_phrases(manual_path):
    """Extract phrases handling the box format"""
    with open(manual_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    phrases = []
    
    # Split by ### Frase headers
    sections = re.split(r'### Frase (\d+):', content)
    
    for i in range(1, len(sections), 2):
        if i + 1 >= len(sections):
            break
            
        phrase_num = sections[i].strip()
        phrase_block = sections[i + 1]
        
        # Get description (first line after header)
        desc = phrase_block.split('\n')[0].strip()
        
        # Find English - look for **English**: followed by quoted text
        english = None
        for line in phrase_block.split('\n'):
            if '**English**:' in line:
                # Extract text between quotes
                match = re.search(r'"([^"]+)"', line)
                if match:
                    english = match.group(1)
                    break
        
        # Find Spanish - look for 🗣️ **Español**:
        spanish = None
        for line in phrase_block.split('\n'):
            if '🗣️' in line and '**Español**:' in line:
                cleaned = clean_line(line)
                # Extract everything after Español:
                match = re.search(r'\*\*Español\*\*:\s*(.+)', cleaned)
                if match:
                    spanish = match.group(1).strip()
                    break
        
        # Find Tip - look for 💡 **TIP**:
        tip_lines = []
        in_tip = False
        for line in phrase_block.split('\n'):
            if '💡' in line and '**TIP**:' in line:
                in_tip = True
                cleaned = clean_line(line)
                match = re.search(r'\*\*TIP\*\*:\s*(.+)', cleaned)
                if match:
                    tip_lines.append(match.group(1))
            elif in_tip and '│' in line and not '**' in line:
                cleaned = clean_line(line)
                if cleaned:
                    tip_lines.append(cleaned)
            elif in_tip and ('└' in line or '---' in line or '###' in line):
                break
        
        tip = ' '.join(tip_lines).strip() if tip_lines else ''
        
        if english and spanish:
            phrases.append({
                'num': phrase_num,
                'desc': desc,
                'en': english,
                'sp': spanish,
                'tip': tip
            })
        else:
            print(f'  WARNING: Phrase {phrase_num} incomplete - EN:{bool(english)} SP:{bool(spanish)}')
    
    return phrases

# Test extraction
manual_path = Path('generated-resources/test/frases-esenciales-entregas.md')
phrases = extract_all_phrases(str(manual_path))

print(f'\nExtracted {len(phrases)} complete phrases:\n')
for p in phrases[:5]:
    print(f"Phrase {p['num']}: {p['desc']}")
    print(f"  EN: {p['en']}")
    print(f"  SP: {p['sp']}")
    print(f"  Tip: {p['tip'][:60]}..." if len(p['tip']) > 60 else f"  Tip: {p['tip']}")
    print()
