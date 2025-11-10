#!/bin/bash
# Monitor regeneration progress

while true; do
    # Check if process is still running
    if ! ps aux | grep "regenerate-all" | grep -v grep > /dev/null; then
        echo "✅ Regeneration process completed!"
        tail -50 scripts/regeneration-log.txt
        break
    fi

    # Count files
    count=$(ls -1 public/audio/resource-*.mp3 2>/dev/null | wc -l)
    echo "[$(date '+%H:%M:%S')] Generated: $count/56 audio files"

    # Show last few lines
    echo "Last activity:"
    tail -3 scripts/regeneration-log.txt | grep -E "(Processing|SUCCESS|PROGRESS)"
    echo "---"

    sleep 30
done
