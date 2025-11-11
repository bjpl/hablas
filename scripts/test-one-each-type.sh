#!/bin/bash
#
# Test audio generation for one resource of each type
#

echo "========================================================================"
echo "TESTING ADAPTIVE AUDIO FORMATS"
echo "========================================================================"
echo ""

# Test resources:
# 1  = basic_phrases (Frases Esenciales)
# 10 = conversation (Conversaciones con Clientes)
# 12 = directions (Direcciones y Navegación)
# 27 = emergency (Frases de Emergencia)

echo "🧪 Testing 4 resource types:"
echo "  1. Resource 1  - Basic Phrases"
echo "  2. Resource 10 - Conversation"
echo "  3. Resource 12 - Directions"
echo "  4. Resource 27 - Emergency"
echo ""
echo "Press ENTER to start or Ctrl+C to cancel..."
read

# Create a minimal test script that generates just these 4
cat > scripts/test-four-types.py << 'PYTHON_EOF'
#!/usr/bin/env python3
import asyncio
import sys
from pathlib import Path

# Import from main script
sys.path.insert(0, str(Path(__file__).parent))
exec(open('scripts/regenerate-from-source-complete.py').read())

async def test_main():
    """Test just 4 resources - one of each type."""
    log_message("="*80)
    log_message("🧪 TESTING ADAPTIVE AUDIO FORMATS - 4 RESOURCES")
    log_message("="*80)

    # Load mapping
    mapping = load_master_mapping()
    if not mapping:
        log_message("❌ Cannot load master mapping")
        return

    # Test these specific resources
    test_ids = ['1', '10', '12', '27']

    successful = []
    failed = []

    for resource_id in test_ids:
        try:
            result = await regenerate_resource(resource_id, mapping)
            if result:
                successful.append(resource_id)
            else:
                failed.append(resource_id)

            # Small delay between resources
            await asyncio.sleep(0.5)

        except Exception as e:
            log_message(f"❌ Error on resource {resource_id}: {e}")
            failed.append(resource_id)

    # Summary
    log_message("\n" + "="*80)
    log_message("TEST SUMMARY")
    log_message("="*80)
    log_message(f"✅ Successful: {len(successful)} resources")
    log_message(f"❌ Failed: {len(failed)} resources")

    if successful:
        log_message(f"\n✅ Success: {', '.join(successful)}")
    if failed:
        log_message(f"\n❌ Failed: {', '.join(failed)}")

    log_message("="*80)

if __name__ == "__main__":
    asyncio.run(test_main())
PYTHON_EOF

chmod +x scripts/test-four-types.py

# Run the test
echo "Running test..."
python3 scripts/test-four-types.py

# Show results
echo ""
echo "========================================================================"
echo "RESULTS"
echo "========================================================================"
echo ""

for id in 1 10 12 27; do
    file="public/audio/resource-${id}.mp3"
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        echo "✅ Resource $id: $file ($size)"
    else
        echo "❌ Resource $id: NOT FOUND"
    fi
done

echo ""
echo "========================================================================"
echo "View detailed log: scripts/complete-regeneration-log.txt"
echo "========================================================================"
