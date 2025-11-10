#!/bin/bash
# Comprehensive Phrase Coverage Audit
# Maps resources to markdown sources and checks coverage

echo "=== COMPREHENSIVE PHRASE COVERAGE AUDIT ==="
echo "Audit Date: $(date)"
echo ""

# Extract resource mappings from resources.ts
echo "Extracting resource mappings..."

# Create output directory
mkdir -p docs/audit

# Create the full report
cat > docs/audit/PHRASE_COVERAGE_COMPLETE_AUDIT.md << 'EOFREPORT'
# Complete Phrase Coverage Audit Report

**Audit Date:** $(date)
**Auditor:** PhraseCoverageAuditor Agent

## Executive Summary

This audit identifies ALL resources with incomplete phrase coverage by comparing:
1. Phrase count in source markdown files (from "### Frase X:" markers)
2. Phrase count in extracted phrase files (scripts/final-phrases-only/resource-X.txt)

## Critical Findings

### Resources with INCOMPLETE Coverage (< 100%)

EOFREPORT

# Arrays to track results
declare -a INCOMPLETE_RESOURCES
declare -a COMPLETE_RESOURCES
declare -a MISSING_SOURCES
declare -a MISSING_EXTRACTIONS

TOTAL_INCOMPLETE_PHRASES=0
TOTAL_COMPLETE=0
TOTAL_INCOMPLETE=0

# Check each resource
for i in {1..59}; do
    # Get source file from resources.ts if possible
    SOURCE=$(grep -A 20 "\"id\": $i," data/resources.ts | grep "contentPath" | sed 's/.*\\hablas\\//' | sed 's/".*//' | tr '\\' '/')
    
    if [ -z "$SOURCE" ]; then
        SOURCE=""
    fi
    
    # Count phrases in source markdown
    MD_COUNT=0
    if [ -n "$SOURCE" ] && [ -f "$SOURCE" ]; then
        MD_COUNT=$(grep -c "^### Frase [0-9]" "$SOURCE" 2>/dev/null || echo "0")
    fi
    
    # Count extracted phrases
    PHRASE_FILE="scripts/final-phrases-only/resource-${i}.txt"
    EXTRACTED=0
    if [ -f "$PHRASE_FILE" ]; then
        LINES=$(wc -l < "$PHRASE_FILE")
        EXTRACTED=$(( LINES / 6 ))
    fi
    
    # Determine status
    if [ "$MD_COUNT" -eq 0 ]; then
        if [ "$EXTRACTED" -gt 0 ]; then
            echo "Resource $i: Has $EXTRACTED extracted phrases but NO SOURCE MARKDOWN found"
            MISSING_SOURCES+=("$i")
        else
            echo "Resource $i: MISSING both source and extraction"
            MISSING_EXTRACTIONS+=("$i")
        fi
    elif [ "$EXTRACTED" -eq 0 ]; then
        echo "Resource $i: Has $MD_COUNT phrases in markdown but NO EXTRACTION"
        INCOMPLETE_RESOURCES+=("$i")
        TOTAL_INCOMPLETE_PHRASES=$((TOTAL_INCOMPLETE_PHRASES + MD_COUNT))
        TOTAL_INCOMPLETE=$((TOTAL_INCOMPLETE + 1))
    elif [ "$EXTRACTED" -lt "$MD_COUNT" ]; then
        MISSING=$((MD_COUNT - EXTRACTED))
        COVERAGE=$(awk "BEGIN {printf \"%.0f\", ($EXTRACTED / $MD_COUNT) * 100}")
        echo "Resource $i: INCOMPLETE - $EXTRACTED/$MD_COUNT phrases (${COVERAGE}% coverage, missing $MISSING)"
        INCOMPLETE_RESOURCES+=("$i")
        TOTAL_INCOMPLETE_PHRASES=$((TOTAL_INCOMPLETE_PHRASES + MISSING))
        TOTAL_INCOMPLETE=$((TOTAL_INCOMPLETE + 1))
        
        # Add to report
        echo "- **Resource $i**: $EXTRACTED/$MD_COUNT phrases (${COVERAGE}% coverage) - **MISSING $MISSING PHRASES**" >> docs/audit/PHRASE_COVERAGE_COMPLETE_AUDIT.md
    else
        echo "Resource $i: COMPLETE - $EXTRACTED phrases (100%+ coverage)"
        COMPLETE_RESOURCES+=("$i")
        TOTAL_COMPLETE=$((TOTAL_COMPLETE + 1))
    fi
done

# Complete the report
cat >> docs/audit/PHRASE_COVERAGE_COMPLETE_AUDIT.md << EOFREPORT

**Total Incomplete Resources:** ${#INCOMPLETE_RESOURCES[@]}
**Total Missing Phrases:** $TOTAL_INCOMPLETE_PHRASES

### Resources with COMPLETE Coverage (100%+)

EOFREPORT

for res in "${COMPLETE_RESOURCES[@]}"; do
    echo "- Resource $res" >> docs/audit/PHRASE_COVERAGE_COMPLETE_AUDIT.md
done

cat >> docs/audit/PHRASE_COVERAGE_COMPLETE_AUDIT.md << EOFREPORT

**Total Complete Resources:** $TOTAL_COMPLETE

### Resources with Missing Source Markdowns

EOFREPORT

for res in "${MISSING_SOURCES[@]}"; do
    echo "- Resource $res (has extraction but no source markdown found)" >> docs/audit/PHRASE_COVERAGE_COMPLETE_AUDIT.md
done

cat >> docs/audit/PHRASE_COVERAGE_COMPLETE_AUDIT.md << EOFREPORT

### Resources with Missing Extractions

EOFREPORT

for res in "${MISSING_EXTRACTIONS[@]}"; do
    echo "- Resource $res (no extraction file found)" >> docs/audit/PHRASE_COVERAGE_COMPLETE_AUDIT.md
done

cat >> docs/audit/PHRASE_COVERAGE_COMPLETE_AUDIT.md << EOFREPORT

## Action Plan

### Priority 1: Resources with Incomplete Coverage
These resources need phrase regeneration to cover ALL phrases from the markdown:

EOFREPORT

for res in "${INCOMPLETE_RESOURCES[@]}"; do
    echo "- [ ] Resource $res" >> docs/audit/PHRASE_COVERAGE_COMPLETE_AUDIT.md
done

cat >> docs/audit/PHRASE_COVERAGE_COMPLETE_AUDIT.md << EOFREPORT

### Estimated Work

- **Resources to Regenerate:** ${#INCOMPLETE_RESOURCES[@]}
- **Total Missing Phrases:** $TOTAL_INCOMPLETE_PHRASES
- **Estimated Time:** ~$(( TOTAL_INCOMPLETE_PHRASES / 2 )) minutes (at 30 seconds per phrase)

## Recommendations

1. **Regenerate audio for all incomplete resources** to cover 100% of phrases
2. **Investigate missing source markdowns** for resources with extractions but no source
3. **Create missing extractions** for resources with sources but no extraction files
4. **Verify 15-phrase limit** was not incorrectly applied to resources 1-37

EOFREPORT

echo ""
echo "=== AUDIT SUMMARY ==="
echo "Complete Resources: $TOTAL_COMPLETE"
echo "Incomplete Resources: ${#INCOMPLETE_RESOURCES[@]}"
echo "Missing Sources: ${#MISSING_SOURCES[@]}"
echo "Missing Extractions: ${#MISSING_EXTRACTIONS[@]}"
echo "Total Missing Phrases: $TOTAL_INCOMPLETE_PHRASES"
echo ""
echo "Full report saved to: docs/audit/PHRASE_COVERAGE_COMPLETE_AUDIT.md"

