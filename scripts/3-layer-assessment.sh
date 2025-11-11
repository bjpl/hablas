#!/bin/bash
# 3-Layer Resource Assessment Script
# Analyzes: Website Description → Source Content → Audio Files

OUTPUT_DIR="docs"
REPORT_FILE="${OUTPUT_DIR}/3-LAYER-ASSESSMENT-REPORT.md"
JSON_FILE="${OUTPUT_DIR}/assessment-3-layer.json"
FIXES_FILE="${OUTPUT_DIR}/fixes-prioritized.json"

# Initialize report
cat > "$REPORT_FILE" << 'EOF'
# 3-Layer Resource Assessment Report

**Generated:** $(date)
**Total Resources:** 56 (IDs 1-34 from generated batch, 35-59 from JSON conversions)

## Assessment Methodology

**LAYER 1 - Website Display (data/resources.ts)**
- Promises made in resource descriptions
- Expected content (e.g., "30 frases", "25 phrases")

**LAYER 2 - Downloadable Content (Source Files)**
- Actual content in markdown/text/json files
- Count of phrases/sections via pattern matching
- File size and structure

**LAYER 3 - Audio Files (public/audio/*.mp3)**
- Actual MP3 file existence and size
- Estimated content via file size analysis
- Expected: ~100-150 KB per phrase for bilingual audio

---

EOF

echo "## RESOURCE ANALYSIS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Initialize JSON
echo '{
  "timestamp": "'$(date -Iseconds)'",
  "total_resources": 56,
  "resources": [' > "$JSON_FILE"

# Function to count phrases in markdown
count_md_phrases() {
    local file="$1"
    if [ -f "$file" ]; then
        # Count "### Frase N:" or "### N." patterns
        grep -c "^###.*[Ff]rase\|^### [0-9]\+\." "$file" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# Function to count phrases in audio script
count_audio_script() {
    local file="$1"
    if [ -f "$file" ]; then
        # Count "FRASE" markers
        grep -c "FRASE\|^###.*FRASE" "$file" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# Function to estimate audio phrase count from file size
estimate_audio_phrases() {
    local file="$1"
    if [ -f "$file" ]; then
        local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        # Estimate: 100-150 KB per phrase average for bilingual
        local estimate=$((size / 125000))
        echo "$estimate"
    else
        echo "0"
    fi
}

# Analyze each resource
for id in {1..59}; do
    # Skip missing IDs (3, 8, 24)
    if [ "$id" -eq 3 ] || [ "$id" -eq 8 ] || [ "$id" -eq 24 ]; then
        continue
    fi

    echo "Analyzing Resource $id..."

    # Get audio file
    AUDIO_FILE="public/audio/resource-${id}.mp3"

    # Determine source file based on ID range
    if [ "$id" -le 34 ]; then
        # Generated batch resources
        SOURCE_FILE=$(grep -A1 "\"id\": ${id}," data/resources.ts | grep "contentPath" | cut -d'"' -f4 | sed 's/\\/\//g' | sed 's/C://g' | sed 's/^/\/mnt\/c/')
    else
        # JSON-converted resources
        SOURCE_FILE=$(grep -A1 "\"id\": ${id}," data/resources.ts | grep "contentPath" | cut -d'"' -f4 | sed 's/\\/\//g' | sed 's/C://g' | sed 's/^/\/mnt\/c/')
    fi

    # Count content
    if [[ "$SOURCE_FILE" == *.md ]]; then
        CONTENT_COUNT=$(count_md_phrases "$SOURCE_FILE")
    elif [[ "$SOURCE_FILE" == *.txt ]]; then
        CONTENT_COUNT=$(count_audio_script "$SOURCE_FILE")
    else
        CONTENT_COUNT="N/A"
    fi

    # Get audio estimate
    if [ -f "$AUDIO_FILE" ]; then
        AUDIO_SIZE=$(stat -f%z "$AUDIO_FILE" 2>/dev/null || stat -c%s "$AUDIO_FILE" 2>/dev/null)
        AUDIO_EXISTS="Yes"
        AUDIO_ESTIMATE=$(estimate_audio_phrases "$AUDIO_FILE")
    else
        AUDIO_SIZE=0
        AUDIO_EXISTS="No"
        AUDIO_ESTIMATE=0
    fi

    # Write to report
    echo "### Resource $id" >> "$REPORT_FILE"
    echo "- **Source:** $SOURCE_FILE" >> "$REPORT_FILE"
    echo "- **Content Count:** $CONTENT_COUNT phrases/sections" >> "$REPORT_FILE"
    echo "- **Audio Exists:** $AUDIO_EXISTS" >> "$REPORT_FILE"
    echo "- **Audio Size:** $AUDIO_SIZE bytes" >> "$REPORT_FILE"
    echo "- **Audio Estimated:** ~$AUDIO_ESTIMATE phrases" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
done

echo "Assessment complete! Check $REPORT_FILE"
