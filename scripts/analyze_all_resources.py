#!/usr/bin/env python3
"""
Direct 3-Layer Assessment
Manually analyzes all 56 resources
"""

import os
import re
from pathlib import Path
from datetime import datetime
import json

BASE = Path("/mnt/c/Users/brand/Development/Project_Workspace/active-development/hablas")

# Define all resources manually
RESOURCES = [
    {'id': 1, 'title': 'Frases Esenciales para Entregas - Var 1', 'promise': 30, 'source': 'generated-resources/50-batch/repartidor/basic_phrases_1.md'},
    {'id': 2, 'title': 'Pronunciación: Entregas - Var 1', 'promise': 8, 'source': 'generated-resources/50-batch/repartidor/basic_audio_1-audio-script.txt'},
    {'id': 4, 'title': 'Frases Esenciales para Entregas - Var 2', 'promise': 30, 'source': 'generated-resources/50-batch/repartidor/basic_phrases_2.md'},
    {'id': 5, 'title': 'Situaciones Complejas en Entregas - Var 1', 'promise': 30, 'source': 'generated-resources/50-batch/repartidor/intermediate_situations_1.md'},
    {'id': 6, 'title': 'Frases Esenciales para Entregas - Var 3', 'promise': 30, 'source': 'generated-resources/50-batch/repartidor/basic_phrases_3.md'},
    {'id': 7, 'title': 'Pronunciación: Entregas - Var 2', 'promise': 8, 'source': 'generated-resources/50-batch/repartidor/basic_audio_2-audio-script.txt'},
    {'id': 9, 'title': 'Frases Esenciales para Entregas - Var 4', 'promise': 30, 'source': 'generated-resources/50-batch/repartidor/basic_phrases_4.md'},
    {'id': 10, 'title': 'Conversaciones con Clientes - Var 1', 'promise': 10, 'source': 'generated-resources/50-batch/repartidor/intermediate_conversations_1-audio-script.txt'},
    {'id': 11, 'title': 'Saludos y Confirmación de Pasajeros - Var 1', 'promise': 30, 'source': 'generated-resources/50-batch/conductor/basic_greetings_1.md'},
    {'id': 12, 'title': 'Direcciones y Navegación GPS - Var 1', 'promise': 30, 'source': 'generated-resources/50-batch/conductor/basic_directions_1.md'},
    {'id': 13, 'title': 'Audio: Direcciones en Inglés - Var 1', 'promise': 8, 'source': 'generated-resources/50-batch/conductor/basic_audio_navigation_1-audio-script.txt'},
    {'id': 14, 'title': 'Saludos y Confirmación de Pasajeros - Var 2', 'promise': 30, 'source': 'generated-resources/50-batch/conductor/basic_greetings_2.md'},
    {'id': 15, 'title': 'Direcciones y Navegación GPS - Var 2', 'promise': 30, 'source': 'generated-resources/50-batch/conductor/basic_directions_2.md'},
    {'id': 16, 'title': 'Small Talk con Pasajeros - Var 1', 'promise': 30, 'source': 'generated-resources/50-batch/conductor/intermediate_smalltalk_1.md'},
    {'id': 17, 'title': 'Saludos y Confirmación de Pasajeros - Var 3', 'promise': 30, 'source': 'generated-resources/50-batch/conductor/basic_greetings_3.md'},
    {'id': 18, 'title': 'Audio: Direcciones en Inglés - Var 2', 'promise': 8, 'source': 'generated-resources/50-batch/conductor/basic_audio_navigation_2-audio-script.txt'},
    {'id': 19, 'title': 'Direcciones y Navegación GPS - Var 3', 'promise': 30, 'source': 'generated-resources/50-batch/conductor/basic_directions_3.md'},
    {'id': 20, 'title': 'Manejo de Situaciones Difíciles - Var 1', 'promise': 30, 'source': 'generated-resources/50-batch/conductor/intermediate_problems_1.md'},
    {'id': 21, 'title': 'Saludos Básicos en Inglés - Var 1', 'promise': 8, 'source': 'generated-resources/50-batch/all/basic_greetings_all_1-audio-script.txt'},
    {'id': 22, 'title': 'Números y Direcciones - Var 1', 'promise': 30, 'source': 'generated-resources/50-batch/all/basic_numbers_1.md'},
    {'id': 23, 'title': 'Tiempo y Horarios - Var 1', 'promise': 30, 'source': 'generated-resources/50-batch/all/basic_time_1.md'},
    {'id': 25, 'title': 'Servicio al Cliente en Inglés - Var 1', 'promise': 30, 'source': 'generated-resources/50-batch/all/intermediate_customer_service_1.md'},
    {'id': 26, 'title': 'Manejo de Quejas y Problemas - Var 1', 'promise': 30, 'source': 'generated-resources/50-batch/all/intermediate_complaints_1.md'},
    {'id': 27, 'title': 'Frases de Emergencia - Var 1', 'promise': 30, 'source': 'generated-resources/50-batch/all/emergency_phrases_1.md'},
    {'id': 28, 'title': 'Saludos Básicos en Inglés - Var 2', 'promise': 8, 'source': 'generated-resources/50-batch/all/basic_greetings_all_2-audio-script.txt'},
    {'id': 29, 'title': 'Números y Direcciones - Var 2', 'promise': 30, 'source': 'generated-resources/50-batch/all/basic_numbers_2.md'},
    {'id': 30, 'title': 'Protocolos de Seguridad - Var 1', 'promise': 30, 'source': 'generated-resources/50-batch/all/safety_protocols_1.md'},
    {'id': 31, 'title': 'Situaciones Complejas en Entregas - Var 2', 'promise': 30, 'source': 'generated-resources/50-batch/repartidor/intermediate_situations_2.md'},
    {'id': 32, 'title': 'Conversaciones con Clientes - Var 2', 'promise': 8, 'source': 'generated-resources/50-batch/repartidor/intermediate_conversations_2-audio-script.txt'},
    {'id': 33, 'title': 'Small Talk con Pasajeros - Var 2', 'promise': 30, 'source': 'generated-resources/50-batch/conductor/intermediate_smalltalk_2.md'},
    {'id': 34, 'title': 'Diálogos Reales con Pasajeros - Var 1', 'promise': 10, 'source': 'generated-resources/50-batch/conductor/intermediate_audio_conversations_1-audio-script.txt'},
    # JSON-converted resources (IDs 35-59)
    {'id': 35, 'title': 'Gig Economy Business Terminology', 'promise': None, 'source': 'docs/resources/converted/avanzado/business-terminology.md'},
    {'id': 36, 'title': 'Professional Complaint Handling', 'promise': None, 'source': 'docs/resources/converted/avanzado/complaint-handling.md'},
    {'id': 37, 'title': 'Professional Conflict Resolution', 'promise': None, 'source': 'docs/resources/converted/avanzado/conflict-resolution.md'},
    {'id': 38, 'title': 'Cross-Cultural Professional Communication', 'promise': None, 'source': 'docs/resources/converted/avanzado/cross-cultural-communication.md'},
    {'id': 39, 'title': 'Customer Service Excellence', 'promise': None, 'source': 'docs/resources/converted/avanzado/customer-service-excellence.md'},
    {'id': 40, 'title': 'Earnings Optimization Communication', 'promise': None, 'source': 'docs/resources/converted/avanzado/earnings-optimization.md'},
    {'id': 41, 'title': 'Professional Negotiation Skills', 'promise': None, 'source': 'docs/resources/converted/avanzado/negotiation-skills.md'},
    {'id': 42, 'title': 'Professional Boundaries and Self-Protection', 'promise': None, 'source': 'docs/resources/converted/avanzado/professional-boundaries.md'},
    {'id': 43, 'title': 'Professional Communication Essentials', 'promise': None, 'source': 'docs/resources/converted/avanzado/professional-communication.md'},
    {'id': 44, 'title': 'Professional Time Management', 'promise': None, 'source': 'docs/resources/converted/avanzado/time-management.md'},
    {'id': 45, 'title': 'Vehicle Accident Procedures', 'promise': None, 'source': 'docs/resources/converted/emergency/accident-procedures.md'},
    {'id': 46, 'title': 'Customer Conflicts and Disputes', 'promise': None, 'source': 'docs/resources/converted/emergency/customer-conflict.md'},
    {'id': 47, 'title': 'Lost Items and Property Disputes', 'promise': None, 'source': 'docs/resources/converted/emergency/lost-or-found-items.md'},
    {'id': 48, 'title': 'Medical Emergencies - Critical Communication', 'promise': None, 'source': 'docs/resources/converted/emergency/medical-emergencies.md'},
    {'id': 49, 'title': 'Payment Disputes and Financial Conflicts', 'promise': None, 'source': 'docs/resources/converted/emergency/payment-disputes.md'},
    {'id': 50, 'title': 'Personal Safety - Threat and Danger Response', 'promise': None, 'source': 'docs/resources/converted/emergency/safety-concerns.md'},
    {'id': 51, 'title': 'Vehicle Breakdown and Mechanical Emergencies', 'promise': None, 'source': 'docs/resources/converted/emergency/vehicle-breakdown.md'},
    {'id': 52, 'title': 'Severe Weather and Hazardous Conditions', 'promise': None, 'source': 'docs/resources/converted/emergency/weather-hazards.md'},
    {'id': 53, 'title': 'Airport Rideshare - Essential Procedures', 'promise': None, 'source': 'docs/resources/converted/app-specific/airport-rideshare.md'},
    {'id': 54, 'title': 'DoorDash Delivery - Essential Vocabulary', 'promise': None, 'source': 'docs/resources/converted/app-specific/doordash-delivery.md'},
    {'id': 55, 'title': 'Lyft Driver - Essential Scenarios', 'promise': None, 'source': 'docs/resources/converted/app-specific/lyft-driver-essentials.md'},
    {'id': 56, 'title': 'Multi-App Strategy - Maximizing Gig Work', 'promise': None, 'source': 'docs/resources/converted/app-specific/multi-app-strategy.md'},
    {'id': 57, 'title': 'Platform Ratings System - Mastery Guide', 'promise': None, 'source': 'docs/resources/converted/app-specific/platform-ratings-mastery.md'},
    {'id': 58, 'title': 'Tax Management and Business Expenses', 'promise': None, 'source': 'docs/resources/converted/app-specific/tax-and-expenses.md'},
    {'id': 59, 'title': 'Uber Driver - Essential Scenarios', 'promise': None, 'source': 'docs/resources/converted/app-specific/uber-driver-essentials.md'},
]

def count_phrases_md(filepath):
    """Count phrases in markdown"""
    patterns = [
        r'^###\s+[Ff]rase\s+\d+',
        r'^###\s+\d+\.',
        r'^\*\*[Ff]rase\s+\d+',
        r'^##\s+Essential Phrases',  # For JSON-converted resources
    ]

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # For JSON-converted resources, count "### N." patterns
        if 'converted' in str(filepath):
            count = len(re.findall(r'^###\s+\d+\.', content, re.MULTILINE))
            return count, "JSON-converted resource"
        else:
            # For generated resources
            max_count = 0
            for pattern in patterns:
                matches = re.findall(pattern, content, re.MULTILINE)
                max_count = max(max_count, len(matches))
            return max_count, "Generated resource"
    except:
        return 0, "Error reading file"

def count_phrases_txt(filepath):
    """Count phrases in audio scripts"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        count = len(re.findall(r'FRASE\s+\d+', content, re.IGNORECASE))
        return count, "Audio script"
    except:
        return 0, "Error reading file"

def analyze_audio(resource_id):
    """Analyze audio file"""
    audio_file = BASE / "public" / "audio" / f"resource-{resource_id}.mp3"

    if not audio_file.exists():
        return {'exists': False, 'size': 0, 'est': 0}

    size = audio_file.stat().st_size
    est = int(size / 125000)  # ~125KB per phrase

    return {'exists': True, 'size': size, 'size_mb': round(size / 1024 / 1024, 2), 'est': est}

# Analyze all
results = []
perfect = []
promise_over = []
source_over = []
audio_over = []
missing = []

for res in RESOURCES:
    rid = res['id']
    source_path = BASE / res['source']

    # Layer 2: Source
    if source_path.exists():
        if source_path.suffix == '.md':
            actual, note = count_phrases_md(source_path)
        else:
            actual, note = count_phrases_txt(source_path)
        source_exists = True
    else:
        actual = 0
        note = "Missing"
        source_exists = False

    # Layer 3: Audio
    audio = analyze_audio(rid)

    result = {
        'id': rid,
        'title': res['title'],
        'promise': res['promise'],
        'actual': actual,
        'audio_est': audio['est'],
        'audio_exists': audio['exists'],
        'audio_size_mb': audio.get('size_mb', 0),
        'source_exists': source_exists
    }

    # Categorize
    if not source_exists or not audio['exists']:
        missing.append(result)
        result['cat'] = 'MISSING'
    elif res['promise'] and actual and audio['est']:
        diff_promise = abs(res['promise'] - actual)
        diff_audio = abs(actual - audio['est'])

        if diff_promise <= 2 and diff_audio <= 2:
            perfect.append(result)
            result['cat'] = 'PERFECT'
        elif res['promise'] > actual + 3:
            promise_over.append(result)
            result['cat'] = 'PROMISE_OVER'
        elif actual > audio['est'] + 3:
            source_over.append(result)
            result['cat'] = 'SOURCE_OVER'
        elif audio['est'] > actual + 3:
            audio_over.append(result)
            result['cat'] = 'AUDIO_OVER'
        else:
            perfect.append(result)
            result['cat'] = 'ALIGNED'
    else:
        result['cat'] = 'NO_PROMISE'

    results.append(result)

# Generate report
report = [
    "# 3-Layer Resource Assessment Report",
    f"\n**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    f"**Total Resources:** {len(results)}",
    "\n---\n",
    "## Summary Statistics\n",
    f"- ✅ **Perfect Alignment:** {len(perfect)}",
    f"- ⚠️ **Website Promise > Source:** {len(promise_over)}",
    f"- ⚠️ **Source > Audio:** {len(source_over)}",
    f"- ⚠️ **Audio > Source:** {len(audio_over)}",
    f"- 🚨 **Missing Files:** {len(missing)}",
    "\n---\n"
]

if perfect:
    report.append("## ✅ PERFECT ALIGNMENT\n")
    for r in perfect:
        report.append(f"### Resource {r['id']}: {r['title']}")
        report.append(f"- Promise: {r['promise']} | Source: {r['actual']} | Audio: {r['audio_est']} ({r['audio_size_mb']} MB)\n")

if promise_over:
    report.append("## ⚠️ WEBSITE PROMISE > SOURCE\n")
    for r in promise_over:
        report.append(f"### Resource {r['id']}: {r['title']}")
        report.append(f"- Promise: {r['promise']} | Source: {r['actual']} ❌ | Audio: {r['audio_est']}")
        report.append(f"- **FIX:** Add {r['promise'] - r['actual']} phrases OR update description\n")

if source_over:
    report.append("## ⚠️ SOURCE > AUDIO\n")
    for r in source_over:
        report.append(f"### Resource {r['id']}: {r['title']}")
        report.append(f"- Promise: {r['promise']} | Source: {r['actual']} | Audio: {r['audio_est']} ❌")
        report.append(f"- **FIX:** Regenerate audio\n")

if audio_over:
    report.append("## ⚠️ AUDIO > SOURCE\n")
    for r in audio_over:
        report.append(f"### Resource {r['id']}: {r['title']}")
        report.append(f"- Promise: {r['promise']} | Source: {r['actual']} | Audio: {r['audio_est']} ❌")
        report.append(f"- **FIX:** Regenerate audio from correct source\n")

if missing:
    report.append("## 🚨 MISSING FILES\n")
    for r in missing:
        report.append(f"### Resource {r['id']}: {r['title']}")
        report.append(f"- Source: {r['source_exists']} | Audio: {r['audio_exists']}\n")

# Write report
report_path = BASE / "docs" / "3-LAYER-ASSESSMENT-REPORT.md"
with open(report_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(report))

# Write JSON
json_path = BASE / "docs" / "assessment-3-layer.json"
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump({
        'timestamp': datetime.now().isoformat(),
        'summary': {
            'total': len(results),
            'perfect': len(perfect),
            'promise_over': len(promise_over),
            'source_over': len(source_over),
            'audio_over': len(audio_over),
            'missing': len(missing)
        },
        'resources': results
    }, f, indent=2)

print(f"✅ Report: {report_path}")
print(f"✅ JSON: {json_path}")
print("\nSUMMARY:")
print(f"  Perfect: {len(perfect)}")
print(f"  Promise>Source: {len(promise_over)}")
print(f"  Source>Audio: {len(source_over)}")
print(f"  Audio>Source: {len(audio_over)}")
print(f"  Missing: {len(missing)}")
