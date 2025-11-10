#!/bin/bash
# Count phrases in all markdown sources and compare with extracted phrases

echo "Resource,Source_File,Markdown_Phrases,Extracted_Phrases,Coverage_Percent,Status" > /tmp/phrase-coverage.csv

for i in {1..59}; do
    # Try to find source markdown
    SOURCE=""
    MD_COUNT=0
    
    # Check various possible locations
    for pattern in "generated-resources/50-batch/repartidor/basic_phrases_${i}.md" \
                   "generated-resources/50-batch/conductor/basic_greetings_${i}.md" \
                   "generated-resources/50-batch/conductor/basic_directions_${i}.md" \
                   "generated-resources/50-batch/all/emergency_phrases_${i}.md"; do
        if [ -f "$pattern" ]; then
            SOURCE="$pattern"
            break
        fi
    done
    
    # If found, count phrases
    if [ -n "$SOURCE" ]; then
        MD_COUNT=$(grep -c "^### Frase [0-9]" "$SOURCE" 2>/dev/null || echo "0")
    fi
    
    # Count extracted phrases
    PHRASE_FILE="scripts/final-phrases-only/resource-${i}.txt"
    if [ -f "$PHRASE_FILE" ]; then
        LINES=$(wc -l < "$PHRASE_FILE")
        EXTRACTED=$(( LINES / 6 ))
    else
        EXTRACTED=0
    fi
    
    # Calculate coverage
    if [ "$MD_COUNT" -gt 0 ]; then
        COVERAGE=$(awk "BEGIN {printf \"%.0f\", ($EXTRACTED / $MD_COUNT) * 100}")
        if [ "$EXTRACTED" -lt "$MD_COUNT" ]; then
            STATUS="INCOMPLETE"
        else
            STATUS="COMPLETE"
        fi
    else
        COVERAGE="N/A"
        STATUS="NO_SOURCE"
    fi
    
    echo "$i,$SOURCE,$MD_COUNT,$EXTRACTED,$COVERAGE,$STATUS" >> /tmp/phrase-coverage.csv
done

cat /tmp/phrase-coverage.csv
