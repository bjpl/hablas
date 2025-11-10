#!/usr/bin/env python3
import re
from pathlib import Path

manual = Path('public/generated-resources/50-batch/repartidor/basic_phrases_1.md')
content = manual.read_text(encoding='utf-8')

# Extract ALL phrase blocks
sections = re.split(r'### Frase (\d+):', content)
print(f'Total sections: {len(sections)}')
print(f'Should have {(len(sections)-1)//2} phrases\n')

phrases = []
for i in range(1, len(sections), 2):
    if i + 1 >= len(sections):
        break
    
    num = sections[i].strip()
    block = sections[i + 1]
    
    # Extract English from box
    en_match = re.search(r'\*\*English\*\*:\s*"([^"]+)"', block)
    # Extract Spanish from box  
    sp_match = re.search(r'🗣️\s*\*\*Español\*\*:\s*([^\n]+)', block)
    
    en = en_match.group(1) if en_match else None
    sp_raw = sp_match.group(1) if sp_match else None
    sp = re.sub(r'[│└─┘┐┌]', '', sp_raw).strip() if sp_raw else None
    
    if en and sp:
        phrases.append((num, en, sp))
        print(f'{num:2s}. EN: {en[:50]:50s} SP: {sp[:40]}')
    else:
        print(f'{num:2s}. FAILED - EN:{bool(en)} SP:{bool(sp)}')

print(f'\n✅ Successfully extracted {len(phrases)}/30 phrases')
