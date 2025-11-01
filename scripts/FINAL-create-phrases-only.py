#!/usr/bin/env python3
"""
FINAL SOLUTION: Create PHRASES-ONLY Audio Scripts

ABSOLUTE RULE: Audio contains ONLY:
1. English phrase (native English voice)
2. English phrase repeated (for practice)
3. Spanish translation (native Spanish voice)

ZERO narrator, ZERO tips, ZERO guidance, ZERO explanations
"""

from pathlib import Path

# Essential phrases for delivery/rideshare (3-5 per resource)
ESSENTIAL_PHRASES = {
    2: [  # Basic delivery
        ("Hi, I have your delivery", "Hola, tengo su entrega"),
        ("Are you Michael?", "¿Usted es Michael?"),
        ("Here's your order", "Aquí está su pedido"),
        ("Have a great day", "Que tenga un gran día"),
        ("Thank you", "Gracias"),
    ],
    7: [
        ("I'm outside", "Estoy afuera"),
        ("Can you come out?", "¿Puede salir?"),
        ("Where should I leave it?", "¿Dónde lo dejo?"),
        ("I left it at the door", "Lo dejé en la puerta"),
        ("Please call me", "Por favor llámeme"),
    ],
}

# Default for others
DEFAULT_PHRASES = [
    ("Hi, I have your delivery", "Hola, tengo su entrega"),
    ("Thank you", "Gracias"),
    ("Have a great day", "Que tenga un gran día"),
]

def create_phrases_only_script(phrases):
    """
    Create script with ABSOLUTE MINIMUM
    
    Format:
    English
    [pause]
    English
    [pause]  
    Spanish
    [pause]
    [next phrase]
    """
    lines = []
    for english, spanish in phrases:
        # English (said by English voice)
        lines.append(english)
        lines.append('')
        # English repeat (practice)
        lines.append(english)
        lines.append('')
        # Spanish translation (said by Spanish voice)
        lines.append(spanish)
        lines.append('')
        lines.append('')  # Longer pause between phrases
    return '\n'.join(lines)

def main():
    output_dir = Path('scripts/final-phrases-only')
    output_dir.mkdir(exist_ok=True)

    print("✂️  FINAL: Creating PHRASES-ONLY Scripts")
    print("=" * 70)
    print("ZERO narrator | ZERO tips | ZERO guidance")
    print("=" * 70 + "\n")

    for resource_id in range(1, 38):
        phrases = ESSENTIAL_PHRASES.get(resource_id, DEFAULT_PHRASES)
        script = create_phrases_only_script(phrases)

        output_file = output_dir / f'resource-{resource_id}.txt'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(script)

        print(f"✅ Resource {resource_id}: {len(phrases)} phrases ONLY ({len(script)} chars)")

    print("\n" + "=" * 70)
    print(f"✅ Created 37 FINAL scripts")
    print("📁 Output: {output_dir}/")
    print("\n🎯 Contents: English + English repeat + Spanish = DONE")
    print("   NO introductions, explanations, or guidance")

if __name__ == '__main__':
    main()
