#!/bin/bash
# Convenient wrapper script for Azure TTS audio generation

set -e

echo "======================================================================"
echo "Azure TTS Audio Generation - Hablas Project"
echo "======================================================================"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 not found"
    echo "   Please install Python 3.7 or higher"
    exit 1
fi

echo "✓ Python found: $(python3 --version)"

# Check if Azure credentials are set
if [ -z "$AZURE_SPEECH_KEY" ]; then
    echo ""
    echo "❌ Error: AZURE_SPEECH_KEY environment variable not set"
    echo ""
    echo "Set your Azure credentials:"
    echo "  export AZURE_SPEECH_KEY='your-key-here'"
    echo "  export AZURE_SPEECH_REGION='eastus'"
    echo ""
    echo "Get credentials from: https://portal.azure.com"
    echo "  1. Create a Speech Service resource"
    echo "  2. Copy the Key and Region"
    exit 1
fi

echo "✓ Azure credentials configured"
echo ""

# Check if requirements are installed
if ! python3 -c "import azure.cognitiveservices.speech" 2>/dev/null; then
    echo "Installing Python dependencies..."
    pip install -r scripts/azure-audio-requirements.txt
    echo ""
fi

echo "✓ Dependencies installed"
echo ""

# Check if we should run test first
if [ "$1" == "--test" ]; then
    echo "Running configuration test..."
    python3 scripts/test-azure-audio.py
    exit $?
fi

# Run the audio generation
echo "Starting audio generation..."
echo ""
python3 scripts/generate-azure-audio.py

echo ""
echo "======================================================================"
echo "Generation complete!"
echo "======================================================================"
echo "Output: public/audio/"
echo "Metadata: public/audio/metadata.json"
