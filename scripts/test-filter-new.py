#!/usr/bin/env python3
"""Test the UPDATED content filter"""

from pathlib import Path

def test_filter(resource_num):
    script_path = Path(f'scripts/final-phrases-only/resource-{resource_num}.txt')
    script_text = script_path.read_text(encoding='utf-8')

    # Split into lines
    all_lines = [line.strip() for line in script_text.split('\n') if line.strip()]

    print(f"\n{'='*70}")
    print(f"TESTING RESOURCE {resource_num}")
    print(f"{'='*70}\n")
    print(f"TOTAL LINES: {len(all_lines)}\n")

    # STRICT FILTER: Only keep actual spoken content
    lines = []
    i = 0
    while i < len(all_lines):
        line = all_lines[i]

        # Skip ALL non-content lines (but be precise!)
        if (line.startswith('#') or          # Headers
            line.startswith('=====') or      # Section dividers
            line.startswith('━━━━━') or      # Section dividers
            line.startswith('---') or        # Dividers
            line.startswith('**') or         # Metadata
            line.startswith('(')):           # Parenthetical notes
            print(f"[SKIP {i:3d}] Format: {line[:60]}")
            i += 1
            continue

        # Skip specific section header lines
        line_upper = line.upper().strip()
        if (line_upper.startswith('SECTION ') or
            line_upper == 'CORE CONCEPTS' or
            line_upper == 'MULTI-APP STRATEGY' or
            line_upper == 'EFFICIENCY METRICS' or
            line_upper == 'STRATEGY DISCUSSIONS' or
            line_upper.endswith(' BEST PRACTICES')):
            print(f"[SKIP {i:3d}] Header: {line[:60]}")
            i += 1
            continue

        # Keep tips/notes as-is
        if line.startswith('['):
            print(f"[KEEP {i:3d}] Note:   {line[:60]}")
            lines.append(line)
            i += 1
            continue

        # For phrase groups after "=== PHRASE N:"
        if i > 0 and '===' in all_lines[i-1] and 'PHRASE' in all_lines[i-1].upper():
            print(f"[SKIP {i:3d}] Dup:    {line[:60]}")
            i += 1
            if i < len(all_lines):
                print(f"[KEEP {i:3d}] EN:     {all_lines[i]}")
                lines.append(all_lines[i])
                i += 1
            if i < len(all_lines) and not all_lines[i].startswith('['):
                print(f"[KEEP {i:3d}] SP:     {all_lines[i]}")
                lines.append(all_lines[i])
                i += 1
            continue

        # UNIVERSAL DUPLICATE DETECTOR
        if i + 1 < len(all_lines) and line == all_lines[i + 1]:
            print(f"[SKIP {i:3d}] Dup:    {line[:60]}")
            i += 1
            if i < len(all_lines):
                print(f"[KEEP {i:3d}] EN:     {all_lines[i]}")
                lines.append(all_lines[i])
                i += 1
            if i < len(all_lines) and not all_lines[i].startswith('['):
                print(f"[KEEP {i:3d}] SP:     {all_lines[i]}")
                lines.append(all_lines[i])
                i += 1
            continue

        # Default: keep the line
        if line and not line.startswith('('):
            print(f"[KEEP {i:3d}] Text:   {line[:60]}")
            lines.append(line)
        i += 1

    print(f"\n{'='*70}")
    print("FINAL KEPT CONTENT:")
    print(f"{'='*70}\n")
    for i, line in enumerate(lines, 1):
        print(f"{i:3d}. {line}")

    print(f"\n\nTotal kept: {len(lines)} lines out of {len(all_lines)} original lines\n")

# Test both formats
test_filter(1)
test_filter(56)
