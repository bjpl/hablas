#!/bin/bash
# Phrase Coverage Audit Script
# Identifies resources with incomplete phrase coverage

echo "=== PHRASE COVERAGE AUDIT ==="
echo "Date: $(date)"
echo ""

TOTAL_RESOURCES=0
COMPLETE_RESOURCES=0
INCOMPLETE_RESOURCES=0
MISSING_PHRASE_FILES=0

# Output file
REPORT_FILE="docs/PHRASE_COVERAGE_AUDIT_REPORT.md"

# Start report
cat > "$REPORT_FILE" << 'EOF'
# Phrase Coverage Audit Report

**Audit Date:** $(date)
**Auditor:** PhraseCoverageAuditor

## Executive Summary

This report identifies resources with incomplete phrase coverage where audio files contain fewer phrases than the source markdown files.

## Methodology

For each resource:
1. Count phrases in source markdown (search for "## Frase", "Phrase", or numbered entries)
2. Count phrases in phrase extraction file (`scripts/final-phrases-only/resource-{id}.txt`)
3. Calculate coverage percentage
4. Flag resources with <100% coverage

## Findings

### Resources with Complete Coverage (100%)

EOF

echo "Scanning resources 1-59..."
echo ""

for i in {1..59}; do
    TOTAL_RESOURCES=$((TOTAL_RESOURCES + 1))

    # Check if phrase file exists
    PHRASE_FILE="scripts/final-phrases-only/resource-${i}.txt"

    if [ ! -f "$PHRASE_FILE" ]; then
        echo "❌ Resource $i: No phrase file found"
        MISSING_PHRASE_FILES=$((MISSING_PHRASE_FILES + 1))
        continue
    fi

    # Count phrases in phrase file (subtract header lines, divide by 6)
    TOTAL_LINES=$(wc -l < "$PHRASE_FILE" 2>/dev/null || echo "0")
    # Format is: English, English phonetic, Spanish with blank lines = 6 lines per phrase
    PHRASE_COUNT=$(( (TOTAL_LINES - 3) / 6 ))

    # Try to find source markdown
    SOURCE_FILE=""

    # Check generated-resources
    if [ -f "generated-resources/50-batch/repartidor/basic_phrases_${i}.md" ]; then
        SOURCE_FILE="generated-resources/50-batch/repartidor/basic_phrases_${i}.md"
    elif [ -f "generated-resources/50-batch/conductor/basic_phrases_${i}.md" ]; then
        SOURCE_FILE="generated-resources/50-batch/conductor/basic_phrases_${i}.md"
    fi

    # If we found a source, count phrases in it
    if [ -n "$SOURCE_FILE" ] && [ -f "$SOURCE_FILE" ]; then
        # Count "## Frase" or "## Phrase" markers
        SOURCE_PHRASE_COUNT=$(grep -c "^## Frase\|^## Phrase" "$SOURCE_FILE" 2>/dev/null || echo "0")

        if [ "$SOURCE_PHRASE_COUNT" -gt 0 ]; then
            COVERAGE=$(awk "BEGIN {printf \"%.1f\", ($PHRASE_COUNT / $SOURCE_PHRASE_COUNT) * 100}")

            if [ "$PHRASE_COUNT" -lt "$SOURCE_PHRASE_COUNT" ]; then
                echo "⚠️  Resource $i: $PHRASE_COUNT/$SOURCE_PHRASE_COUNT phrases (${COVERAGE}% coverage)"
                INCOMPLETE_RESOURCES=$((INCOMPLETE_RESOURCES + 1))
            else
                echo "✅ Resource $i: $PHRASE_COUNT phrases (100% coverage)"
                COMPLETE_RESOURCES=$((COMPLETE_RESOURCES + 1))
            fi
        else
            echo "ℹ️  Resource $i: $PHRASE_COUNT phrases extracted (no phrase markers in source)"
        fi
    else
        echo "ℹ️  Resource $i: $PHRASE_COUNT phrases extracted (no source markdown found)"
    fi
done

echo ""
echo "=== SUMMARY ==="
echo "Total Resources Checked: $TOTAL_RESOURCES"
echo "Complete Coverage: $COMPLETE_RESOURCES"
echo "Incomplete Coverage: $INCOMPLETE_RESOURCES"
echo "Missing Phrase Files: $MISSING_PHRASE_FILES"
echo ""
echo "Report saved to: $REPORT_FILE"
