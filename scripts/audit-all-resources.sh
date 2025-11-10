#!/bin/bash
# Comprehensive Resource Audio Audit Script
# Checks ALL 59 resources for audio script accuracy

REPORT_DIR="docs/audit"
REPORT_FILE="$REPORT_DIR/resource-audit-detailed-$(date +%Y%m%d-%H%M%S).md"
AUDIO_SCRIPT_DIR="scripts/final-phrases-only"

mkdir -p "$REPORT_DIR"

echo "# DETAILED RESOURCE AUDIT REPORT" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "## AUDIT RESULTS BY RESOURCE" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Function to count phrases in audio script
count_audio_phrases() {
    local resource_id=$1
    local audio_file="$AUDIO_SCRIPT_DIR/resource-$resource_id.txt"

    if [[ ! -f "$audio_file" ]]; then
        echo "0"
        return
    fi

    # Count non-empty English lines (every 3rd line in pattern)
    grep -v '^$' "$audio_file" | awk 'NR % 3 == 1' | wc -l
}

# Function to check if audio script matches source
check_resource() {
    local resource_id=$1
    local source_path=$2
    local resource_title=$3
    local resource_type=$4

    echo "### Resource $resource_id: $resource_title" >> "$REPORT_FILE"
    echo "- **Type**: $resource_type" >> "$REPORT_FILE"
    echo "- **Source**: \`$source_path\`" >> "$REPORT_FILE"

    # Count phrases
    local phrase_count=$(count_audio_phrases "$resource_id")
    echo "- **Audio Phrases**: $phrase_count" >> "$REPORT_FILE"

    # Check if source file exists
    if [[ ! -f "$source_path" ]]; then
        echo "- **Status**: ❌ SOURCE FILE NOT FOUND" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        return
    fi

    # Check audio script exists
    if [[ ! -f "$AUDIO_SCRIPT_DIR/resource-$resource_id.txt" ]]; then
        echo "- **Status**: ❌ AUDIO SCRIPT MISSING" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        return
    fi

    # Type-specific analysis
    case "$resource_type" in
        "pdf")
            # Check for markdown phrase patterns
            local source_phrases=$(grep -c '│ \*\*English\*\*:' "$source_path" 2>/dev/null || echo "0")
            echo "- **Source Phrases Found**: $source_phrases" >> "$REPORT_FILE"

            if [[ $phrase_count -lt 10 ]]; then
                echo "- **Status**: ⚠️ TOO FEW PHRASES (< 10)" >> "$REPORT_FILE"
            elif [[ $phrase_count -gt 25 ]]; then
                echo "- **Status**: ⚠️ TOO MANY PHRASES (> 25)" >> "$REPORT_FILE"
            else
                echo "- **Status**: ✅ Phrase count OK (needs content verification)" >> "$REPORT_FILE"
            fi
            ;;

        "audio")
            # Check for audio script dialogue patterns
            local source_dialogues=$(grep -c '^"' "$source_path" 2>/dev/null || echo "0")
            echo "- **Source Dialogues Found**: $source_dialogues" >> "$REPORT_FILE"

            if [[ $phrase_count -lt 5 ]]; then
                echo "- **Status**: ⚠️ TOO FEW PHRASES (< 5)" >> "$REPORT_FILE"
            else
                echo "- **Status**: ✅ Phrase count OK (needs content verification)" >> "$REPORT_FILE"
            fi
            ;;

        "image")
            # Check for image spec vocabulary
            local source_vocab=$(grep -c 'vocabulary' "$source_path" 2>/dev/null || echo "0")
            echo "- **Source Vocab Sections**: $source_vocab" >> "$REPORT_FILE"
            echo "- **Status**: ✅ Needs manual review" >> "$REPORT_FILE"
            ;;

        *)
            echo "- **Status**: ⚠️ Unknown type" >> "$REPORT_FILE"
            ;;
    esac

    # Sample first 3 phrases from audio script
    echo "" >> "$REPORT_FILE"
    echo "**Sample Audio Phrases**:" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    head -9 "$AUDIO_SCRIPT_DIR/resource-$resource_id.txt" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
}

# Resource definitions (from resources.ts)
# Format: check_resource ID "source_path" "title" "type"

echo "Starting comprehensive audit of 59 resources..."
echo ""

# Resources 1-10
check_resource 1 "generated-resources/50-batch/repartidor/basic_phrases_1.md" "Frases Esenciales - Var 1" "pdf"
check_resource 2 "generated-resources/50-batch/repartidor/basic_audio_1-audio-script.txt" "Pronunciación - Var 1" "audio"
check_resource 3 "generated-resources/50-batch/repartidor/basic_visual_1-image-spec.md" "Guía Visual - Var 1" "image"
check_resource 4 "generated-resources/50-batch/repartidor/basic_phrases_2.md" "Frases Esenciales - Var 2" "pdf"
check_resource 5 "generated-resources/50-batch/repartidor/intermediate_situations_1.md" "Situaciones Complejas - Var 1" "pdf"
check_resource 6 "generated-resources/50-batch/repartidor/basic_phrases_3.md" "Frases Esenciales - Var 3" "pdf"
check_resource 7 "generated-resources/50-batch/repartidor/basic_audio_2-audio-script.txt" "Pronunciación - Var 2" "audio"
check_resource 8 "generated-resources/50-batch/repartidor/basic_visual_2-image-spec.md" "Guía Visual - Var 2" "image"
check_resource 9 "generated-resources/50-batch/repartidor/basic_phrases_4.md" "Frases Esenciales - Var 4" "pdf"
check_resource 10 "generated-resources/50-batch/repartidor/intermediate_conversations_1-audio-script.txt" "Conversaciones - Var 1" "audio"

# Resources 11-20
check_resource 11 "generated-resources/50-batch/conductor/basic_greetings_1.md" "Saludos Pasajeros - Var 1" "pdf"
check_resource 12 "generated-resources/50-batch/conductor/basic_directions_1.md" "Direcciones GPS - Var 1" "pdf"
check_resource 13 "generated-resources/50-batch/conductor/basic_audio_navigation_1-audio-script.txt" "Audio Direcciones - Var 1" "audio"
check_resource 14 "generated-resources/50-batch/conductor/basic_greetings_2.md" "Saludos Pasajeros - Var 2" "pdf"
check_resource 15 "generated-resources/50-batch/conductor/basic_directions_2.md" "Direcciones GPS - Var 2" "pdf"
check_resource 16 "generated-resources/50-batch/conductor/intermediate_smalltalk_1.md" "Small Talk - Var 1" "pdf"
check_resource 17 "generated-resources/50-batch/conductor/basic_greetings_3.md" "Saludos Pasajeros - Var 3" "pdf"
check_resource 18 "generated-resources/50-batch/conductor/basic_audio_navigation_2-audio-script.txt" "Audio Direcciones - Var 2" "audio"
check_resource 19 "generated-resources/50-batch/conductor/basic_directions_3.md" "Direcciones GPS - Var 3" "pdf"
check_resource 20 "generated-resources/50-batch/conductor/intermediate_problems_1.md" "Situaciones Difíciles - Var 1" "pdf"

# Resources 21-34
check_resource 21 "generated-resources/50-batch/all/basic_greetings_all_1-audio-script.txt" "Saludos Básicos - Var 1" "audio"
check_resource 22 "generated-resources/50-batch/all/basic_numbers_1.md" "Números y Direcciones - Var 1" "pdf"
check_resource 23 "generated-resources/50-batch/all/basic_time_1.md" "Tiempo y Horarios - Var 1" "pdf"
check_resource 24 "generated-resources/50-batch/all/basic_app_vocabulary_1-image-spec.md" "Vocabulario Apps - Var 1" "image"
check_resource 25 "generated-resources/50-batch/all/intermediate_customer_service_1.md" "Servicio al Cliente - Var 1" "pdf"
check_resource 26 "generated-resources/50-batch/all/intermediate_complaints_1.md" "Manejo de Quejas - Var 1" "pdf"
check_resource 27 "generated-resources/50-batch/all/emergency_phrases_1.md" "Frases de Emergencia - Var 1" "pdf"
check_resource 28 "generated-resources/50-batch/all/basic_greetings_all_2-audio-script.txt" "Saludos Básicos - Var 2" "audio"
check_resource 29 "generated-resources/50-batch/all/basic_numbers_2.md" "Números y Direcciones - Var 2" "pdf"
check_resource 30 "generated-resources/50-batch/all/safety_protocols_1.md" "Protocolos de Seguridad - Var 1" "pdf"
check_resource 31 "generated-resources/50-batch/repartidor/intermediate_situations_2.md" "Situaciones Complejas - Var 2" "pdf"
check_resource 32 "generated-resources/50-batch/repartidor/intermediate_conversations_2-audio-script.txt" "Conversaciones - Var 2" "audio"
check_resource 33 "generated-resources/50-batch/conductor/intermediate_smalltalk_2.md" "Small Talk - Var 2" "pdf"
check_resource 34 "generated-resources/50-batch/conductor/intermediate_audio_conversations_1-audio-script.txt" "Diálogos Reales - Var 1" "audio"

# Resources 35-44 (Avanzado)
check_resource 35 "docs/resources/converted/avanzado/business-terminology.md" "Business Terminology" "pdf"
check_resource 36 "docs/resources/converted/avanzado/complaint-handling.md" "Complaint Handling" "pdf"
check_resource 37 "docs/resources/converted/avanzado/conflict-resolution.md" "Conflict Resolution" "pdf"
check_resource 38 "docs/resources/converted/avanzado/cross-cultural-communication.md" "Cross-Cultural Communication" "pdf"
check_resource 39 "docs/resources/converted/avanzado/customer-service-excellence.md" "Customer Service Excellence" "pdf"
check_resource 40 "docs/resources/converted/avanzado/earnings-optimization.md" "Earnings Optimization" "pdf"
check_resource 41 "docs/resources/converted/avanzado/negotiation-skills.md" "Negotiation Skills" "pdf"
check_resource 42 "docs/resources/converted/avanzado/professional-boundaries.md" "Professional Boundaries" "pdf"
check_resource 43 "docs/resources/converted/avanzado/professional-communication.md" "Professional Communication" "pdf"
check_resource 44 "docs/resources/converted/avanzado/time-management.md" "Time Management" "pdf"

# Resources 45-52 (Emergency - CRITICAL)
check_resource 45 "docs/resources/converted/emergency/accident-procedures.md" "Accident Procedures" "pdf"
check_resource 46 "docs/resources/converted/emergency/customer-conflict.md" "Customer Conflicts" "pdf"
check_resource 47 "docs/resources/converted/emergency/lost-or-found-items.md" "Lost Items" "pdf"
check_resource 48 "docs/resources/converted/emergency/medical-emergencies.md" "Medical Emergencies" "pdf"
check_resource 49 "docs/resources/converted/emergency/payment-disputes.md" "Payment Disputes" "pdf"
check_resource 50 "docs/resources/converted/emergency/safety-concerns.md" "Personal Safety" "pdf"
check_resource 51 "docs/resources/converted/emergency/vehicle-breakdown.md" "Vehicle Breakdown" "pdf"
check_resource 52 "docs/resources/converted/emergency/weather-hazards.md" "Weather Hazards" "pdf"

# Resources 53-59 (App-Specific)
check_resource 53 "docs/resources/converted/app-specific/airport-rideshare.md" "Airport Rideshare" "pdf"
check_resource 54 "docs/resources/converted/app-specific/doordash-delivery.md" "DoorDash Delivery" "pdf"
check_resource 55 "docs/resources/converted/app-specific/lyft-driver-essentials.md" "Lyft Driver" "pdf"
check_resource 56 "docs/resources/converted/app-specific/multi-app-strategy.md" "Multi-App Strategy" "pdf"
check_resource 57 "docs/resources/converted/app-specific/platform-ratings-mastery.md" "Platform Ratings" "pdf"
check_resource 58 "docs/resources/converted/app-specific/tax-and-expenses.md" "Tax Management" "pdf"
check_resource 59 "docs/resources/converted/app-specific/uber-driver-essentials.md" "Uber Driver" "pdf"

echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## SUMMARY" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- Total Resources Audited: 59" >> "$REPORT_FILE"
echo "- Audit Completed: $(date)" >> "$REPORT_FILE"
echo "- Next Steps: Manual content verification for flagged resources" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Audit complete! Report saved to: $REPORT_FILE"
echo ""
echo "Next step: Review report and manually verify content matches for flagged resources"
