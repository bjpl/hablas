#!/usr/bin/env python3
"""Test the content filter to see what it keeps"""

from pathlib import Path

script_path = Path('scripts/final-phrases-only/resource-1.txt')
script_text = script_path.read_text(encoding='utf-8')

# Split into lines
all_lines = [line.strip() for line in script_text.split('\n') if line.strip()]

print("TOTAL LINES:", len(all_lines))
print("\n" + "="*60)
print("FILTERING PROCESS:")
print("="*60 + "\n")

# STRICT FILTER: Only keep actual spoken content
lines = []
i = 0
while i < len(all_lines):
    line = all_lines[i]

    # Skip ALL non-content lines
    if (line.startswith('#') or          # Headers
        line.startswith('=') or          # Dividers
        line.startswith('━') or          # Dividers
        line.startswith('-') or          # Dividers
        line.startswith('**') or         # Metadata
        'SECTION' in line.upper()):      # Section headers
        print(f"[SKIP {i}] {line[:60]}...")
        i += 1
        continue

    # Keep tips as-is
    if line.startswith('[Tip:'):
        print(f"[KEEP {i}] TIP: {line[:60]}...")
        lines.append(line)
        i += 1
        continue

    # For phrase groups after "=== PHRASE N:", skip duplicate, keep English and Spanish
    if i > 0 and '===' in all_lines[i-1] and 'PHRASE' in all_lines[i-1].upper():
        print(f"[SKIP {i}] Duplicate: {line}")
        i += 1
        if i < len(all_lines):
            print(f"[KEEP {i}] ENGLISH: {all_lines[i]}")
            lines.append(all_lines[i])
            i += 1
        if i < len(all_lines) and not all_lines[i].startswith('['):
            print(f"[KEEP {i}] SPANISH: {all_lines[i]}")
            lines.append(all_lines[i])
            i += 1
        continue

    # Default: keep the line
    if line:
        print(f"[KEEP {i}] Default: {line[:60]}...")
        lines.append(line)
    i += 1

print("\n" + "="*60)
print("FINAL KEPT CONTENT:")
print("="*60)
for i, line in enumerate(lines, 1):
    print(f"{i}. {line}")

print(f"\n\nTotal kept: {len(lines)} lines out of {len(all_lines)} original lines")
