#!/usr/bin/env python3
"""
Create MINIMAL Audio Scripts - PHRASES ONLY

Students should hear ONLY:
1. English phrase (native voice)
2. English phrase repeated
3. Spanish translation

NO introductions, NO tips, NO explanations
"""

from pathlib import Path

# Minimal essential phrases for each resource
# Based on the resource topic/category
MINIMAL_SCRIPTS = {
    # Resources 1-9: Delivery basics
    1: [
        ("Hi, I have your delivery", "Hola, tengo su entrega"),
        ("Are you Michael?", "¿Usted es Michael?"),
        ("Here's your order", "Aquí está su pedido"),
        ("Have a great day", "Que tenga un gran día"),
        ("Thank you", "Gracias"),
    ],
    3: [
        ("I'm outside", "Estoy afuera"),
        ("Can you come out?", "¿Puede salir?"),
        ("Where should I leave it?", "¿Dónde lo dejo?"),
        ("I left it at the door", "Lo dejé en la puerta"),
    ],
    4: [
        ("Please sign here", "Firme aquí por favor"),
        ("I need the code", "Necesito el código"),
        ("What's the gate code?", "¿Cuál es el código del portón?"),
    ],
    5: [
        ("One moment please", "Un momento por favor"),
        ("I'm looking for the address", "Estoy buscando la dirección"),
        ("Can you help me find you?", "¿Puede ayudarme a encontrarlo?"),
    ],
    # Continue for all 37 with essential phrases only
}

def create_minimal_script(phrases):
    """Create ultra-clean script with ONLY phrases"""
    lines = []
    for english, spanish in phrases:
        lines.append(english)
        lines.append('')  # pause
        lines.append(english)  # repeat
        lines.append('')
        lines.append(spanish)
        lines.append('')
        lines.append('')  # longer pause between phrases
    return '\n'.join(lines)

def main():
    output_dir = Path('scripts/minimal-dialogue-scripts')
    output_dir.mkdir(exist_ok=True)

    # Default minimal phrases (for resources without specific content)
    default_phrases = [
        ("Hi, I have your delivery", "Hola, tengo su entrega"),
        ("Thank you", "Gracias"),
        ("Have a great day", "Que tenga un gran día"),
    ]

    print("✂️  Creating MINIMAL Audio Scripts (Phrases ONLY)")
    print("=" * 60)

    for resource_id in range(1, 38):
        phrases = MINIMAL_SCRIPTS.get(resource_id, default_phrases)
        script = create_minimal_script(phrases)

        output_file = output_dir / f'resource-{resource_id}-minimal.txt'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(script)

        print(f"✅ Resource {resource_id}: {len(phrases)} essential phrases")

    print("\n" + "=" * 60)
    print("✅ Created 37 MINIMAL scripts")
    print("📁 Output: scripts/minimal-dialogue-scripts/")
    print("\n🎯 These contain ONLY:")
    print("   - English phrase")
    print("   - English phrase (repeat)")
    print("   - Spanish translation")
    print("   - NOTHING ELSE")

if __name__ == '__main__':
    main()
