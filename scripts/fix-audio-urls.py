#!/usr/bin/env python3
"""
Fix resources.ts by removing incorrect audioUrl fields
Keep audio URL ONLY for resources: 2, 7, 10, 13, 18, 21, 28, 32, 34
Remove audio URL from all other resources
"""

import re

# Resources that SHOULD have audioUrl (actual audio files)
KEEP_AUDIO = {2, 7, 10, 13, 18, 21, 28, 32, 34}

# Resources that should NOT have audioUrl (PDFs, images)
REMOVE_AUDIO = {1, 3, 4, 5, 6, 8, 9, 11, 12, 14, 15, 16, 17, 19, 20, 22, 23, 24, 25, 26, 27, 29, 30, 31, 33, 35, 36, 37}

def fix_resources_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    new_lines = []
    current_id = None
    skip_next_audio_line = False

    for i, line in enumerate(lines):
        # Check if this line defines a resource ID
        id_match = re.search(r'"id":\s*(\d+)', line)
        if id_match:
            current_id = int(id_match.group(1))
            skip_next_audio_line = False

        # Check if this line contains audioUrl
        if '"audioUrl":' in line and current_id is not None:
            # Only keep this line if the resource ID should have audio
            if current_id in KEEP_AUDIO:
                new_lines.append(line)
                print(f"✓ Keeping audioUrl for resource {current_id} (actual audio)")
            elif current_id in REMOVE_AUDIO:
                print(f"✗ Removing audioUrl for resource {current_id} (PDF/image)")
                # Skip this line - don't add it
                continue
            else:
                # Unknown ID - keep it for safety
                new_lines.append(line)
                print(f"? Unknown resource {current_id}, keeping audioUrl")
        else:
            new_lines.append(line)

    # Write the fixed content
    fixed_content = '\n'.join(new_lines)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(fixed_content)

    print(f"\nFixed {filepath}")
    print(f"Removed {len(REMOVE_AUDIO)} incorrect audioUrl fields")
    print(f"Kept {len(KEEP_AUDIO)} correct audioUrl fields")

if __name__ == '__main__':
    fix_resources_file('data/resources.ts')
