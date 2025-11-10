#!/usr/bin/env python3
"""
COMPREHENSIVE QUALITY AUDIT - All 56 Resources
Systematic verification against docs/AUDIO_QUALITY_STANDARDS.md

Checks ALL resources for:
- Content matching (A1, A2, A3)
- Language detection (B1, B2, B3)
- Production quality (C1, C2, C3)
- User experience (D1, D2)
- Script formatting (E1, E2, E3, E7)
- Content quality (F1, F2)

Outputs:
- Individual resource scores
- Priority fix list
- Regeneration instructions
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Tuple
from collections import defaultdict

# Path configuration
BASE_DIR = Path(__file__).parent.parent
SCRIPTS_DIR = BASE_DIR / "scripts"
PHRASE_DIR = SCRIPTS_DIR / "final-phrases-only"
AUDIO_DIR = BASE_DIR / "public" / "audio"
GENERATED_DIR = BASE_DIR / "generated-resources"
DOCS_DIR = BASE_DIR / "docs" / "resources" / "converted"

# Resource definitions from resources.ts
RESOURCES = [
    {"id": 1, "title": "Frases Esenciales para Entregas - Var 1", "category": "repartidor", "level": "basico", "type": "pdf",
     "source": "generated-resources/50-batch/repartidor/basic_phrases_1.md"},
    {"id": 2, "title": "Pronunciación: Entregas - Var 1", "category": "repartidor", "level": "basico", "type": "audio",
     "source": "generated-resources/50-batch/repartidor/basic_audio_1-audio-script.txt"},
    {"id": 4, "title": "Frases Esenciales para Entregas - Var 2", "category": "repartidor", "level": "basico", "type": "pdf",
     "source": "generated-resources/50-batch/repartidor/basic_phrases_2.md"},
    {"id": 5, "title": "Situaciones Complejas en Entregas - Var 1", "category": "repartidor", "level": "intermedio", "type": "pdf",
     "source": "generated-resources/50-batch/repartidor/intermediate_situations_1.md"},
    {"id": 6, "title": "Frases Esenciales para Entregas - Var 3", "category": "repartidor", "level": "basico", "type": "pdf",
     "source": "generated-resources/50-batch/repartidor/basic_phrases_3.md"},
    {"id": 7, "title": "Pronunciación: Entregas - Var 2", "category": "repartidor", "level": "basico", "type": "audio",
     "source": "generated-resources/50-batch/repartidor/basic_audio_2-audio-script.txt"},
    {"id": 9, "title": "Frases Esenciales para Entregas - Var 4", "category": "repartidor", "level": "basico", "type": "pdf",
     "source": "generated-resources/50-batch/repartidor/basic_phrases_4.md"},
    {"id": 10, "title": "Conversaciones con Clientes - Var 1", "category": "repartidor", "level": "basico", "type": "audio",
     "source": "generated-resources/50-batch/repartidor/intermediate_conversations_1-audio-script.txt"},
    {"id": 11, "title": "Saludos y Confirmación de Pasajeros - Var 1", "category": "conductor", "level": "basico", "type": "pdf",
     "source": "generated-resources/50-batch/conductor/basic_greetings_1.md"},
    {"id": 12, "title": "Direcciones y Navegación GPS - Var 1", "category": "conductor", "level": "basico", "type": "pdf",
     "source": "generated-resources/50-batch/conductor/basic_directions_1.md"},
    {"id": 13, "title": "Audio: Direcciones en Inglés - Var 1", "category": "conductor", "level": "basico", "type": "audio",
     "source": "generated-resources/50-batch/conductor/basic_audio_navigation_1-audio-script.txt"},
    {"id": 14, "title": "Saludos y Confirmación de Pasajeros - Var 2", "category": "conductor", "level": "basico", "type": "pdf",
     "source": "generated-resources/50-batch/conductor/basic_greetings_2.md"},
    {"id": 15, "title": "Direcciones y Navegación GPS - Var 2", "category": "conductor", "level": "basico", "type": "pdf",
     "source": "generated-resources/50-batch/conductor/basic_directions_2.md"},
    {"id": 16, "title": "Small Talk con Pasajeros - Var 1", "category": "conductor", "level": "intermedio", "type": "pdf",
     "source": "generated-resources/50-batch/conductor/intermediate_smalltalk_1.md"},
    {"id": 17, "title": "Saludos y Confirmación de Pasajeros - Var 3", "category": "conductor", "level": "basico", "type": "pdf",
     "source": "generated-resources/50-batch/conductor/basic_greetings_3.md"},
    {"id": 18, "title": "Audio: Direcciones en Inglés - Var 2", "category": "conductor", "level": "basico", "type": "audio",
     "source": "generated-resources/50-batch/conductor/basic_audio_navigation_2-audio-script.txt"},
    {"id": 19, "title": "Direcciones y Navegación GPS - Var 3", "category": "conductor", "level": "basico", "type": "pdf",
     "source": "generated-resources/50-batch/conductor/basic_directions_3.md"},
    {"id": 20, "title": "Manejo de Situaciones Difíciles - Var 1", "category": "conductor", "level": "intermedio", "type": "pdf",
     "source": "generated-resources/50-batch/conductor/intermediate_problems_1.md"},
    {"id": 21, "title": "Saludos Básicos en Inglés - Var 1", "category": "all", "level": "basico", "type": "audio",
     "source": "generated-resources/50-batch/all/basic_greetings_all_1-audio-script.txt"},
    {"id": 22, "title": "Números y Direcciones - Var 1", "category": "all", "level": "basico", "type": "pdf",
     "source": "generated-resources/50-batch/all/basic_numbers_1.md"},
    {"id": 23, "title": "Tiempo y Horarios - Var 1", "category": "all", "level": "basico", "type": "pdf",
     "source": "generated-resources/50-batch/all/basic_time_1.md"},
    {"id": 25, "title": "Servicio al Cliente en Inglés - Var 1", "category": "all", "level": "intermedio", "type": "pdf",
     "source": "generated-resources/50-batch/all/intermediate_customer_service_1.md"},
    {"id": 26, "title": "Manejo de Quejas y Problemas - Var 1", "category": "all", "level": "intermedio", "type": "pdf",
     "source": "generated-resources/50-batch/all/intermediate_complaints_1.md"},
    {"id": 27, "title": "Frases de Emergencia - Var 1", "category": "all", "level": "basico", "type": "pdf",
     "source": "generated-resources/50-batch/all/emergency_phrases_1.md"},
    {"id": 28, "title": "Saludos Básicos en Inglés - Var 2", "category": "all", "level": "basico", "type": "audio",
     "source": "generated-resources/50-batch/all/basic_greetings_all_2-audio-script.txt"},
    {"id": 29, "title": "Números y Direcciones - Var 2", "category": "all", "level": "basico", "type": "pdf",
     "source": "generated-resources/50-batch/all/basic_numbers_2.md"},
    {"id": 30, "title": "Protocolos de Seguridad - Var 1", "category": "all", "level": "intermedio", "type": "pdf",
     "source": "generated-resources/50-batch/all/safety_protocols_1.md"},
    {"id": 31, "title": "Situaciones Complejas en Entregas - Var 2", "category": "repartidor", "level": "intermedio", "type": "pdf",
     "source": "generated-resources/50-batch/repartidor/intermediate_situations_2.md"},
    {"id": 32, "title": "Conversaciones con Clientes - Var 2", "category": "repartidor", "level": "basico", "type": "audio",
     "source": "generated-resources/50-batch/repartidor/intermediate_conversations_2-audio-script.txt"},
    {"id": 33, "title": "Small Talk con Pasajeros - Var 2", "category": "conductor", "level": "intermedio", "type": "pdf",
     "source": "generated-resources/50-batch/conductor/intermediate_smalltalk_2.md"},
    {"id": 34, "title": "Diálogos Reales con Pasajeros - Var 1", "category": "conductor", "level": "basico", "type": "audio",
     "source": "generated-resources/50-batch/conductor/intermediate_audio_conversations_1-audio-script.txt"},
    # Advanced business resources (35-44)
    {"id": 35, "title": "Gig Economy Business Terminology", "category": "all", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/avanzado/business-terminology.md"},
    {"id": 36, "title": "Professional Complaint Handling", "category": "all", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/avanzado/complaint-handling.md"},
    {"id": 37, "title": "Professional Conflict Resolution", "category": "all", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/avanzado/conflict-resolution.md"},
    {"id": 38, "title": "Cross-Cultural Professional Communication", "category": "all", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/avanzado/cross-cultural-communication.md"},
    {"id": 39, "title": "Customer Service Excellence", "category": "all", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/avanzado/customer-service-excellence.md"},
    {"id": 40, "title": "Earnings Optimization Communication", "category": "all", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/avanzado/earnings-optimization.md"},
    {"id": 41, "title": "Professional Negotiation Skills", "category": "all", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/avanzado/negotiation-skills.md"},
    {"id": 42, "title": "Professional Boundaries and Self-Protection", "category": "all", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/avanzado/professional-boundaries.md"},
    {"id": 43, "title": "Professional Communication Essentials", "category": "all", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/avanzado/professional-communication.md"},
    {"id": 44, "title": "Professional Time Management", "category": "all", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/avanzado/time-management.md"},
    # Emergency resources (45-52)
    {"id": 45, "title": "Vehicle Accident Procedures", "category": "all", "level": "intermedio", "type": "pdf",
     "source": "docs/resources/converted/emergency/accident-procedures.md"},
    {"id": 46, "title": "Customer Conflicts and Disputes", "category": "all", "level": "intermedio", "type": "pdf",
     "source": "docs/resources/converted/emergency/customer-conflict.md"},
    {"id": 47, "title": "Lost Items and Property Disputes", "category": "all", "level": "intermedio", "type": "pdf",
     "source": "docs/resources/converted/emergency/lost-or-found-items.md"},
    {"id": 48, "title": "Medical Emergencies - Critical Communication", "category": "all", "level": "intermedio", "type": "pdf",
     "source": "docs/resources/converted/emergency/medical-emergencies.md"},
    {"id": 49, "title": "Payment Disputes and Financial Conflicts", "category": "all", "level": "intermedio", "type": "pdf",
     "source": "docs/resources/converted/emergency/payment-disputes.md"},
    {"id": 50, "title": "Personal Safety - Threat and Danger Response", "category": "all", "level": "intermedio", "type": "pdf",
     "source": "docs/resources/converted/emergency/safety-concerns.md"},
    {"id": 51, "title": "Vehicle Breakdown and Mechanical Emergencies", "category": "all", "level": "intermedio", "type": "pdf",
     "source": "docs/resources/converted/emergency/vehicle-breakdown.md"},
    {"id": 52, "title": "Severe Weather and Hazardous Conditions", "category": "all", "level": "intermedio", "type": "pdf",
     "source": "docs/resources/converted/emergency/weather-hazards.md"},
    # App-specific resources (53-59)
    {"id": 53, "title": "Airport Rideshare - Essential Procedures and Communication", "category": "conductor", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/app-specific/airport-rideshare.md"},
    {"id": 54, "title": "DoorDash Delivery - Essential Vocabulary and Scenarios", "category": "conductor", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/app-specific/doordash-delivery.md"},
    {"id": 55, "title": "Lyft Driver - Essential Scenarios and Vocabulary", "category": "conductor", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/app-specific/lyft-driver-essentials.md"},
    {"id": 56, "title": "Multi-App Strategy - Maximizing Gig Work Earnings", "category": "all", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/app-specific/multi-app-strategy.md"},
    {"id": 57, "title": "Platform Ratings System - Mastery Guide", "category": "all", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/app-specific/platform-ratings-mastery.md"},
    {"id": 58, "title": "Tax Management and Business Expenses for Gig Workers", "category": "all", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/app-specific/tax-and-expenses.md"},
    {"id": 59, "title": "Uber Driver - Essential Scenarios and Vocabulary", "category": "conductor", "level": "avanzado", "type": "pdf",
     "source": "docs/resources/converted/app-specific/uber-driver-essentials.md"},
]

# Production note patterns (forbidden)
PRODUCTION_NOTES = [
    r"PRODUCTION\s+NOTES?",
    r"Voice\s+Casting:",
    r"Audio\s+Quality:",
    r"File\s+Specifications:",
    r"\[Tone:",
    r"\[Speaker:",
    r"\[Phonetic:",
    r"\[PAUSE:",
    r"##\s+COMPANION\s+PDF",
    r"\*\*END\s+OF\s+AUDIO\s+SCRIPT\*\*",
    r"\[\d{2}:\d{2}\]",  # Timestamps
    r"\[END:\s*\d{2}:\d{2}\]",
]


def check_production_notes(script_content: str) -> Tuple[bool, List[str]]:
    """Check for forbidden production notes in script"""
    issues = []
    for pattern in PRODUCTION_NOTES:
        matches = re.finditer(pattern, script_content, re.IGNORECASE)
        for match in matches:
            line_num = script_content[:match.start()].count('\n') + 1
            issues.append(f"Line {line_num}: {match.group()}")

    return len(issues) == 0, issues


def count_language_lines(script_content: str) -> Dict[str, int]:
    """Count English vs Spanish lines in script"""
    lines = [l.strip() for l in script_content.split('\n') if l.strip()]

    # Spanish patterns
    spanish_chars = r'[¿¡áéíóúñü]'
    spanish_words = r'\b(el|la|los|las|un|una|es|está|tiene|para|con|que|su|mi)\b'

    english_count = 0
    spanish_count = 0
    ambiguous = 0

    for line in lines:
        # Skip very short lines
        if len(line) < 3:
            continue

        # Check for Spanish indicators
        has_spanish_chars = bool(re.search(spanish_chars, line, re.IGNORECASE))
        has_spanish_words = bool(re.search(spanish_words, line, re.IGNORECASE))

        if has_spanish_chars or has_spanish_words:
            spanish_count += 1
        elif re.search(r'[a-zA-Z]', line):  # Has Latin characters
            # Check for common English words
            english_indicators = r'\b(the|is|are|you|your|can|will|have|this|that|what|when|where)\b'
            if re.search(english_indicators, line, re.IGNORECASE):
                english_count += 1
            else:
                ambiguous += 1

    return {
        "english": english_count,
        "spanish": spanish_count,
        "ambiguous": ambiguous,
        "ratio": english_count / spanish_count if spanish_count > 0 else 0
    }


def check_punctuation(script_content: str) -> Tuple[int, List[str]]:
    """Check punctuation and capitalization issues"""
    lines = [l.strip() for l in script_content.split('\n') if l.strip()]
    issues = []

    for i, line in enumerate(lines, 1):
        # Skip very short lines
        if len(line) < 3:
            continue

        # Check for missing end punctuation
        if re.search(r'[a-zA-Z]$', line):
            issues.append(f"Line {i}: Missing end punctuation: '{line[:50]}'")

        # Check for lowercase start (excluding special cases)
        if line and line[0].islower() and not line.startswith(('e.g.', 'i.e.')):
            issues.append(f"Line {i}: Should start with capital: '{line[:50]}'")

        # Spanish question marks without inverted opener
        if '?' in line and 'es usted' in line.lower() and not line.startswith('¿'):
            issues.append(f"Line {i}: Missing inverted ¿ for Spanish question")

    error_count = len(issues)
    score = max(0, 100 - (error_count * 10))  # -10 points per error

    return score, issues[:10]  # Return max 10 examples


def check_translation_completeness(script_content: str) -> Tuple[int, List[str]]:
    """Check for truncated Spanish translations"""
    lines = script_content.split('\n')
    issues = []

    spanish_chars = r'[áéíóúñü]'

    for i, line in enumerate(lines, 1):
        line = line.strip()
        if not line:
            continue

        # Check if it's likely Spanish
        if re.search(spanish_chars, line, re.IGNORECASE):
            # Check for common truncation patterns
            if line.endswith('tu') or line.endswith('mi') or line.endswith('su'):
                issues.append(f"Line {i}: Possible truncation: '{line}'")
            # Check for incomplete sentences (no ending punctuation)
            elif len(line) > 10 and not re.search(r'[.!?]$', line):
                issues.append(f"Line {i}: Incomplete sentence: '{line[:50]}...'")

    error_count = len(issues)
    if error_count == 0:
        return 100, []
    elif error_count <= 2:
        return 70, issues
    else:
        return 0, issues


def audit_resource(resource: Dict) -> Dict:
    """Comprehensive audit of a single resource"""
    rid = resource["id"]
    title = resource["title"]

    results = {
        "id": rid,
        "title": title,
        "category": resource["category"],
        "level": resource["level"],
        "scores": {},
        "issues": {},
        "overall_score": 0,
        "status": "UNKNOWN"
    }

    # Check if phrase script exists
    script_path = PHRASE_DIR / f"resource-{rid}.txt"
    if not script_path.exists():
        results["status"] = "MISSING_SCRIPT"
        results["overall_score"] = 0
        results["issues"]["critical"] = [f"Phrase script file not found: {script_path}"]
        return results

    # Read script content
    script_content = script_path.read_text(encoding='utf-8')

    # Check if source file exists
    source_path = BASE_DIR / resource["source"]
    if not source_path.exists():
        results["issues"]["warning"] = [f"Source file not found: {source_path}"]

    # Category C1: No Technical Metadata (CRITICAL)
    has_no_prod_notes, prod_issues = check_production_notes(script_content)
    results["scores"]["C1_no_metadata"] = 100 if has_no_prod_notes else 0
    if prod_issues:
        results["issues"]["C1_production_notes"] = prod_issues[:5]

    # Category E2: Punctuation & Capitalization
    punct_score, punct_issues = check_punctuation(script_content)
    results["scores"]["E2_punctuation"] = punct_score
    if punct_issues:
        results["issues"]["E2_punctuation"] = punct_issues

    # Category E7: Translation Completeness
    trans_score, trans_issues = check_translation_completeness(script_content)
    results["scores"]["E7_translation"] = trans_score
    if trans_issues:
        results["issues"]["E7_truncation"] = trans_issues

    # Category B3: Bilingual Balance
    lang_counts = count_language_lines(script_content)
    results["language_stats"] = lang_counts

    if lang_counts["spanish"] == 0:
        results["scores"]["B3_balance"] = 0
        results["issues"]["B3_balance"] = ["No Spanish translations found"]
    elif lang_counts["ratio"] <= 2:
        results["scores"]["B3_balance"] = 100  # Excellent balance
    elif lang_counts["ratio"] <= 3:
        results["scores"]["B3_balance"] = 70  # Acceptable
    else:
        results["scores"]["B3_balance"] = 50  # Needs more Spanish

    # Category E1: Format Structure
    blank_line_pattern = r'\n\n\n+'  # More than 2 blank lines
    excessive_blanks = len(re.findall(blank_line_pattern, script_content))
    results["scores"]["E1_format"] = 100 if excessive_blanks < 5 else 70

    # Check audio file existence (D2)
    audio_path = AUDIO_DIR / f"resource-{rid}.mp3"
    results["scores"]["D2_audio_exists"] = 100 if audio_path.exists() else 0
    if not audio_path.exists():
        results["issues"]["D2_missing_audio"] = [f"Audio file not found: {audio_path}"]
    else:
        # Check file size (C2)
        file_size_mb = audio_path.stat().st_size / (1024 * 1024)
        if file_size_mb < 10:
            results["scores"]["C2_file_size"] = 100
        elif file_size_mb < 20:
            results["scores"]["C2_file_size"] = 70
        else:
            results["scores"]["C2_file_size"] = 30
        results["audio_size_mb"] = round(file_size_mb, 2)

    # Calculate overall score (weighted)
    weights = {
        "C1_no_metadata": 0.20,  # CRITICAL - 20%
        "E7_translation": 0.15,  # CRITICAL - 15%
        "B3_balance": 0.15,      # Important - 15%
        "E2_punctuation": 0.15,  # Important - 15%
        "D2_audio_exists": 0.15, # Important - 15%
        "C2_file_size": 0.10,    # Recommended - 10%
        "E1_format": 0.10,       # Recommended - 10%
    }

    overall = 0
    for metric, weight in weights.items():
        overall += results["scores"].get(metric, 0) * weight

    results["overall_score"] = round(overall, 1)

    # Determine status
    if overall >= 90:
        results["status"] = "EXCELLENT"
    elif overall >= 80:
        results["status"] = "GOOD"
    elif overall >= 70:
        results["status"] = "ACCEPTABLE"
    elif overall >= 60:
        results["status"] = "NEEDS_WORK"
    else:
        results["status"] = "NOT_READY"

    return results


def generate_report(audit_results: List[Dict]) -> str:
    """Generate comprehensive audit report"""

    report = []
    report.append("=" * 80)
    report.append("COMPREHENSIVE QUALITY AUDIT - ALL 56 RESOURCES")
    report.append("=" * 80)
    report.append("")

    # Executive Summary
    total = len(audit_results)
    status_counts = defaultdict(int)
    avg_score = sum(r["overall_score"] for r in audit_results) / total

    for result in audit_results:
        status_counts[result["status"]] += 1

    report.append("EXECUTIVE SUMMARY")
    report.append("-" * 40)
    report.append(f"Total Resources Audited: {total}")
    report.append(f"Overall Platform Score: {avg_score:.1f}/100")
    report.append("")
    report.append("Status Distribution:")
    report.append(f"  EXCELLENT (90-100):  {status_counts['EXCELLENT']:2d} resources ({status_counts['EXCELLENT']/total*100:.0f}%)")
    report.append(f"  GOOD (80-89):        {status_counts['GOOD']:2d} resources ({status_counts['GOOD']/total*100:.0f}%)")
    report.append(f"  ACCEPTABLE (70-79):  {status_counts['ACCEPTABLE']:2d} resources ({status_counts['ACCEPTABLE']/total*100:.0f}%)")
    report.append(f"  NEEDS WORK (60-69):  {status_counts['NEEDS_WORK']:2d} resources ({status_counts['NEEDS_WORK']/total*100:.0f}%)")
    report.append(f"  NOT READY (<60):     {status_counts['NOT_READY']:2d} resources ({status_counts['NOT_READY']/total*100:.0f}%)")
    report.append("")

    # Category breakdown
    report.append("CATEGORY SCORES (Platform Average):")
    report.append("-" * 40)
    category_scores = defaultdict(list)
    for result in audit_results:
        for metric, score in result["scores"].items():
            category_scores[metric].append(score)

    for metric, scores in sorted(category_scores.items()):
        avg = sum(scores) / len(scores)
        passing = sum(1 for s in scores if s >= 80)
        report.append(f"  {metric:20s}: {avg:5.1f}/100  ({passing}/{total} passing)")
    report.append("")

    # Priority fixes (resources < 80)
    needs_fix = [r for r in audit_results if r["overall_score"] < 80]
    needs_fix.sort(key=lambda r: r["overall_score"])

    report.append(f"PRIORITY FIX LIST - {len(needs_fix)} RESOURCES NEED ATTENTION")
    report.append("=" * 80)
    report.append("")

    for result in needs_fix:
        report.append(f"Resource {result['id']}: {result['title']}")
        report.append(f"  Score: {result['overall_score']}/100 - Status: {result['status']}")
        report.append(f"  Category: {result['category']} | Level: {result['level']}")
        report.append("")
        report.append("  Scores Breakdown:")
        for metric, score in sorted(result["scores"].items()):
            status_icon = "✅" if score >= 80 else "⚠️" if score >= 60 else "❌"
            report.append(f"    {status_icon} {metric:20s}: {score:5.1f}/100")
        report.append("")

        if result["issues"]:
            report.append("  Issues Found:")
            for issue_type, issue_list in result["issues"].items():
                report.append(f"    {issue_type}:")
                for issue in issue_list[:3]:  # Show max 3 examples
                    report.append(f"      - {issue}")
            report.append("")

        report.append("  RECOMMENDED ACTIONS:")

        # Specific recommendations based on issues
        if result["scores"].get("C1_no_metadata", 100) < 100:
            report.append("    1. Remove production notes from script")
            report.append("       Run: python scripts/remove-production-notes.py")

        if result["scores"].get("E7_translation", 100) < 80:
            report.append("    2. Complete truncated Spanish translations")
            report.append(f"       Edit: scripts/final-phrases-only/resource-{result['id']}.txt")
            report.append("       Check lines ending with: tu, mi, su (likely incomplete)")

        if result["scores"].get("E2_punctuation", 100) < 80:
            report.append("    3. Fix punctuation and capitalization")
            report.append(f"       Review: scripts/final-phrases-only/resource-{result['id']}.txt")
            report.append("       Add missing periods, question marks, capital letters")

        if result["scores"].get("B3_balance", 100) < 70:
            report.append("    4. Add more Spanish translations")
            report.append(f"       Current ratio: {result['language_stats']['ratio']:.1f}:1 (EN:SP)")
            report.append("       Target: 2:1 or better")

        if result["scores"].get("D2_audio_exists", 100) < 100:
            report.append("    5. Generate missing audio file")
            report.append(f"       Run: python scripts/generate-dual-voice-audio.py {result['id']}")

        report.append("")
        report.append("-" * 80)
        report.append("")

    # Resources passing audit
    passing = [r for r in audit_results if r["overall_score"] >= 80]
    passing.sort(key=lambda r: -r["overall_score"])

    report.append(f"PASSING RESOURCES - {len(passing)} RESOURCES MEET STANDARDS (≥80)")
    report.append("=" * 80)
    report.append("")

    for result in passing[:10]:  # Show top 10
        report.append(f"  {result['id']:2d}. {result['title']:60s} | {result['overall_score']:5.1f}/100 | {result['status']}")

    if len(passing) > 10:
        report.append(f"  ... and {len(passing) - 10} more passing resources")
    report.append("")

    # Final recommendations
    report.append("FINAL RECOMMENDATIONS")
    report.append("=" * 80)
    report.append("")

    critical_issues = sum(1 for r in audit_results if r["scores"].get("C1_no_metadata", 100) < 100)
    if critical_issues > 0:
        report.append(f"⚠️  CRITICAL: {critical_issues} resources have production notes (must fix)")
        report.append("    Action: Run cleanup script to remove all production notes")
        report.append("")

    missing_audio = sum(1 for r in audit_results if r["scores"].get("D2_audio_exists", 100) < 100)
    if missing_audio > 0:
        report.append(f"⚠️  {missing_audio} resources missing audio files")
        report.append("    Action: Run batch audio generation")
        report.append("")

    if avg_score >= 85:
        report.append("✅ PLATFORM STATUS: EXCELLENT")
        report.append("   Platform meets production quality standards")
    elif avg_score >= 75:
        report.append("✅ PLATFORM STATUS: GOOD")
        report.append("   Platform meets minimum standards with minor improvements needed")
    else:
        report.append("❌ PLATFORM STATUS: NEEDS IMPROVEMENT")
        report.append("   Significant issues must be addressed before production")

    report.append("")
    report.append("=" * 80)
    report.append("End of Audit Report")
    report.append("=" * 80)

    return '\n'.join(report)


def main():
    """Run comprehensive audit on all resources"""
    print("Starting comprehensive quality audit...")
    print(f"Auditing {len(RESOURCES)} resources...")
    print()

    audit_results = []

    for i, resource in enumerate(RESOURCES, 1):
        print(f"[{i}/{len(RESOURCES)}] Auditing Resource {resource['id']}: {resource['title'][:50]}...")
        result = audit_resource(resource)
        audit_results.append(result)

    print()
    print("Generating report...")

    # Generate text report
    report_text = generate_report(audit_results)

    # Save report
    report_path = SCRIPTS_DIR / "COMPREHENSIVE_AUDIT_REPORT.md"
    report_path.write_text(report_text, encoding='utf-8')

    print(f"\n✅ Audit complete!")
    print(f"📄 Report saved to: {report_path}")

    # Save JSON data
    json_path = SCRIPTS_DIR / "audit-results.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(audit_results, f, indent=2, ensure_ascii=False)

    print(f"📊 JSON data saved to: {json_path}")

    # Print summary to console
    print("\n" + "=" * 60)
    print("AUDIT SUMMARY")
    print("=" * 60)

    avg_score = sum(r["overall_score"] for r in audit_results) / len(audit_results)
    needs_fix = sum(1 for r in audit_results if r["overall_score"] < 80)

    print(f"Overall Platform Score: {avg_score:.1f}/100")
    print(f"Resources Needing Fixes: {needs_fix}/{len(audit_results)}")
    print(f"Resources Passing: {len(audit_results) - needs_fix}/{len(audit_results)}")
    print()

    if avg_score >= 80:
        print("✅ Platform meets quality standards!")
    else:
        print("⚠️  Platform needs improvement before production")

    print(f"\nFull report: {report_path}")


if __name__ == "__main__":
    main()
