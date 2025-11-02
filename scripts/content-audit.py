#!/usr/bin/env python3
"""
Comprehensive Content Audit Script
Analyzes all 59 resources for completeness, audio mappings, and gaps
"""

import json
import os
import csv
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Any

# Base paths
BASE_DIR = Path("C:/Users/brand/Development/Project_Workspace/active-development/hablas")
RESOURCES_DIR = BASE_DIR / "data" / "resources"
AUDIO_DIR = BASE_DIR / "public" / "audio"

# Expected fields for different resource structures
REQUIRED_FIELDS_BASE = ["id", "title", "description", "level", "category", "targetAudience"]
OPTIONAL_FIELDS = ["subcategory", "culturalContext", "audioUrl"]

# Platform-specific patterns
PLATFORM_PATTERNS = {
    "uber": ["uber", "upfront", "surge", "pool", "uberx"],
    "lyft": ["lyft", "amp", "primetime"],
    "doordash": ["doordash", "dasher", "hotspots"],
    "instacart": ["instacart", "shopper", "batch"]
}

def find_all_resources() -> List[Path]:
    """Find all JSON resource files"""
    resources = []
    for root, dirs, files in os.walk(RESOURCES_DIR):
        for file in files:
            if file.endswith('.json') and file != 'README.md':
                resources.append(Path(root) / file)
    return sorted(resources)

def load_resource(path: Path) -> Dict:
    """Load and parse a resource JSON file"""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        return {"error": str(e), "path": str(path)}

def check_audio_files() -> Dict[str, Path]:
    """Map audio files to resource IDs"""
    audio_map = {}
    for audio_file in AUDIO_DIR.glob("*.mp3"):
        filename = audio_file.stem
        # Extract resource ID from filename (resource-1.mp3 -> 1)
        if filename.startswith("resource-"):
            try:
                res_id = int(filename.split("-")[1])
                audio_map[res_id] = audio_file
            except:
                pass
        audio_map[filename] = audio_file
    return audio_map

def analyze_resource_completeness(resource: Dict) -> Dict[str, Any]:
    """Analyze a single resource for completeness"""
    issues = []
    warnings = []
    stats = {
        "has_audio_url": "audioUrl" in resource,
        "phrase_count": 0,
        "vocabulary_count": 0,
        "scenario_count": 0,
        "cultural_notes_count": 0,
        "missing_fields": [],
        "empty_fields": []
    }

    # Check required fields
    for field in REQUIRED_FIELDS_BASE:
        if field not in resource:
            stats["missing_fields"].append(field)
            issues.append(f"Missing required field: {field}")
        elif not resource.get(field):
            stats["empty_fields"].append(field)
            issues.append(f"Empty field: {field}")

    # Count content elements
    if "phrases" in resource:
        stats["phrase_count"] = len(resource["phrases"])
    elif "commonScenarios" in resource:
        # Count nested phrases in scenarios
        count = 0
        for scenario_key, scenario in resource.get("commonScenarios", {}).items():
            if isinstance(scenario, dict):
                for sub_key, sub_scenario in scenario.items():
                    if isinstance(sub_scenario, dict) and "phrases" in sub_scenario:
                        count += len(sub_scenario["phrases"])
        stats["scenario_count"] = len(resource.get("commonScenarios", {}))
        stats["phrase_count"] = count

    if "vocabulary" in resource:
        stats["vocabulary_count"] = len(resource["vocabulary"])
    elif "platformVocabulary" in resource:
        stats["vocabulary_count"] = len(resource["platformVocabulary"])
    elif "criticalVocabulary" in resource:
        stats["vocabulary_count"] = len(resource["criticalVocabulary"])

    if "culturalNotes" in resource:
        stats["cultural_notes_count"] = len(resource["culturalNotes"])

    # Check pronunciation coverage
    pronunciation_missing = []
    for vocab_key in ["vocabulary", "platformVocabulary", "criticalVocabulary"]:
        if vocab_key in resource:
            for item in resource[vocab_key]:
                if "pronunciation" not in item or not item["pronunciation"]:
                    pronunciation_missing.append(item.get("english", "unknown"))

    if pronunciation_missing:
        warnings.append(f"Missing pronunciations: {', '.join(pronunciation_missing[:3])}{'...' if len(pronunciation_missing) > 3 else ''}")

    # Check translation coverage
    translation_missing = []
    for vocab_key in ["vocabulary", "platformVocabulary", "criticalVocabulary"]:
        if vocab_key in resource:
            for item in resource[vocab_key]:
                if "spanish" not in item or not item["spanish"]:
                    translation_missing.append(item.get("english", "unknown"))

    if translation_missing:
        warnings.append(f"Missing translations: {', '.join(translation_missing[:3])}{'...' if len(translation_missing) > 3 else ''}")

    stats["issues"] = issues
    stats["warnings"] = warnings

    return stats

def categorize_resources(resources_data: List[Dict]) -> Dict[str, List[Dict]]:
    """Categorize resources by type and audience"""
    categories = defaultdict(list)

    for res in resources_data:
        resource = res["data"]
        category = resource.get("category", "unknown")
        target = resource.get("targetAudience", "all")
        subcategory = resource.get("subcategory", "general")

        categories[f"category:{category}"].append(resource)
        categories[f"audience:{target}"].append(resource)
        categories[f"subcategory:{subcategory}"].append(resource)

        # Check for platform-specific content
        resource_text = json.dumps(resource).lower()
        for platform, keywords in PLATFORM_PATTERNS.items():
            if any(keyword in resource_text for keyword in keywords):
                categories[f"platform:{platform}"].append(resource)

    return categories

def identify_gaps(categories: Dict[str, List[Dict]]) -> List[str]:
    """Identify content gaps in coverage"""
    gaps = []

    # Check category balance
    category_counts = {k: len(v) for k, v in categories.items() if k.startswith("category:")}
    total = sum(category_counts.values())

    for cat, count in category_counts.items():
        percentage = (count / total) * 100 if total > 0 else 0
        if percentage < 10:
            gaps.append(f"Low coverage in {cat}: only {count} resources ({percentage:.1f}%)")

    # Check audience coverage
    if "audience:uber-drivers" in categories and "audience:delivery-drivers" in categories:
        uber_count = len(categories["audience:uber-drivers"])
        delivery_count = len(categories["audience:delivery-drivers"])
        if abs(uber_count - delivery_count) > 5:
            gaps.append(f"Imbalanced audience coverage: {uber_count} uber vs {delivery_count} delivery")

    # Check for missing emergency scenarios
    emergency_scenarios = [res for res in categories.get("category:emergency", []) if res]
    emergency_topics = set()
    for res in emergency_scenarios:
        subcategory = res.get("subcategory", "")
        emergency_topics.add(subcategory)

    expected_emergencies = ["accident", "medical", "safety", "weather", "breakdown", "conflict"]
    missing_emergencies = [e for e in expected_emergencies if e not in emergency_topics]
    if missing_emergencies:
        gaps.append(f"Missing emergency topics: {', '.join(missing_emergencies)}")

    # Check advanced topics
    advanced_count = len([r for r in categories.get("category:avanzado", []) if r])
    if advanced_count < 8:
        gaps.append(f"Limited advanced content: only {advanced_count} resources")

    return gaps

def generate_report(resources_data: List[Dict], audio_map: Dict, categories: Dict) -> str:
    """Generate comprehensive audit report"""
    total_resources = len(resources_data)
    resources_with_audio = sum(1 for r in resources_data if r["stats"]["has_audio_url"])
    resources_with_issues = sum(1 for r in resources_data if r["stats"]["issues"])
    resources_with_warnings = sum(1 for r in resources_data if r["stats"]["warnings"])

    report = []
    report.append("=" * 80)
    report.append("HABLAS CONTENT AUDIT REPORT")
    report.append("=" * 80)
    report.append("")

    # Executive Summary
    report.append("EXECUTIVE SUMMARY")
    report.append("-" * 80)
    report.append(f"Total Resources: {total_resources}")
    report.append(f"Audio Files Available: {len(audio_map)}")
    report.append(f"Resources with Audio URL: {resources_with_audio} ({(resources_with_audio/total_resources)*100:.1f}%)")
    report.append(f"Resources WITHOUT Audio URL: {total_resources - resources_with_audio}")
    report.append(f"Resources with Issues: {resources_with_issues}")
    report.append(f"Resources with Warnings: {resources_with_warnings}")
    report.append("")

    # Content Statistics
    report.append("CONTENT STATISTICS")
    report.append("-" * 80)
    total_phrases = sum(r["stats"]["phrase_count"] for r in resources_data)
    total_vocab = sum(r["stats"]["vocabulary_count"] for r in resources_data)
    total_scenarios = sum(r["stats"]["scenario_count"] for r in resources_data)
    total_cultural_notes = sum(r["stats"]["cultural_notes_count"] for r in resources_data)

    report.append(f"Total Phrases: {total_phrases}")
    report.append(f"Total Vocabulary Items: {total_vocab}")
    report.append(f"Total Scenarios: {total_scenarios}")
    report.append(f"Total Cultural Notes: {total_cultural_notes}")
    report.append("")

    # Category Breakdown
    report.append("CATEGORY BREAKDOWN")
    report.append("-" * 80)
    category_counts = {k: len(v) for k, v in categories.items() if k.startswith("category:")}
    for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / total_resources) * 100
        report.append(f"  {cat.replace('category:', '').upper()}: {count} resources ({percentage:.1f}%)")
    report.append("")

    # Audio Coverage
    report.append("AUDIO FILE MAPPING")
    report.append("-" * 80)
    report.append(f"Total Audio Files: {len(audio_map)}")

    # Find resources by ID pattern
    resource_audio_count = sum(1 for k in audio_map.keys() if isinstance(k, int))
    report.append(f"Resource-specific audio (resource-N.mp3): {resource_audio_count}")
    report.append(f"Variation audio files: {len(audio_map) - resource_audio_count}")
    report.append("")

    # Resources without audio
    report.append("RESOURCES WITHOUT AUDIO (9 resources)")
    report.append("-" * 80)
    no_audio_count = 0
    for res_data in resources_data:
        if not res_data["stats"]["has_audio_url"]:
            resource = res_data["data"]
            report.append(f"  [{resource['id']}] {resource['title']}")
            report.append(f"      Category: {resource.get('category', 'N/A')} | Level: {resource.get('level', 'N/A')}")
            no_audio_count += 1
    report.append(f"Total: {no_audio_count} resources need audio")
    report.append("")

    # Critical Issues
    report.append("CRITICAL ISSUES")
    report.append("-" * 80)
    issue_count = 0
    for res_data in resources_data:
        if res_data["stats"]["issues"]:
            resource = res_data["data"]
            report.append(f"  [{resource['id']}] {resource['title']}")
            for issue in res_data["stats"]["issues"]:
                report.append(f"      - {issue}")
            issue_count += 1
    if issue_count == 0:
        report.append("  No critical issues found!")
    report.append("")

    # Warnings
    report.append("WARNINGS & IMPROVEMENTS")
    report.append("-" * 80)
    warning_count = 0
    for res_data in resources_data:
        if res_data["stats"]["warnings"]:
            resource = res_data["data"]
            report.append(f"  [{resource['id']}] {resource['title']}")
            for warning in res_data["stats"]["warnings"][:3]:  # Limit to 3 warnings per resource
                report.append(f"      - {warning}")
            warning_count += 1
    if warning_count == 0:
        report.append("  No warnings!")
    report.append("")

    # Content Gaps
    gaps = identify_gaps(categories)
    report.append("CONTENT GAPS & RECOMMENDATIONS")
    report.append("-" * 80)
    if gaps:
        for i, gap in enumerate(gaps, 1):
            report.append(f"  {i}. {gap}")
    else:
        report.append("  No significant gaps identified!")
    report.append("")

    # Priority Recommendations
    report.append("PRIORITY RECOMMENDATIONS")
    report.append("-" * 80)
    report.append("  HIGH PRIORITY:")
    if no_audio_count > 0:
        report.append(f"    1. Generate audio files for {no_audio_count} resources without audioUrl")
    if issue_count > 0:
        report.append(f"    2. Fix {issue_count} resources with critical field issues")

    report.append("")
    report.append("  MEDIUM PRIORITY:")
    report.append(f"    1. Add missing pronunciations ({resources_with_warnings} resources)")
    report.append("    2. Balance content across categories")
    if gaps:
        report.append(f"    3. Address {len(gaps)} identified content gaps")

    report.append("")
    report.append("  LOW PRIORITY:")
    report.append("    1. Enhance cultural context notes")
    report.append("    2. Add more practical scenarios")
    report.append("    3. Cross-link related resources")
    report.append("")

    report.append("=" * 80)
    report.append("END OF REPORT")
    report.append("=" * 80)

    return "\n".join(report)

def generate_csv_inventory(resources_data: List[Dict], output_path: Path):
    """Generate detailed CSV inventory"""
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            "ID", "Title", "Category", "Subcategory", "Level", "Audience",
            "Has Audio", "Phrases", "Vocabulary", "Scenarios", "Cultural Notes",
            "Issues", "Warnings", "File Path"
        ])

        for res_data in resources_data:
            resource = res_data["data"]
            stats = res_data["stats"]
            writer.writerow([
                resource.get("id", ""),
                resource.get("title", ""),
                resource.get("category", ""),
                resource.get("subcategory", ""),
                resource.get("level", ""),
                resource.get("targetAudience", ""),
                "Yes" if stats["has_audio_url"] else "No",
                stats["phrase_count"],
                stats["vocabulary_count"],
                stats["scenario_count"],
                stats["cultural_notes_count"],
                len(stats["issues"]),
                len(stats["warnings"]),
                res_data["path"]
            ])

def main():
    print("Starting comprehensive content audit...")
    print(f"Resources directory: {RESOURCES_DIR}")
    print(f"Audio directory: {AUDIO_DIR}")
    print()

    # Find all resources
    resource_files = find_all_resources()
    print(f"Found {len(resource_files)} resource files")

    # Check audio files
    audio_map = check_audio_files()
    print(f"Found {len(audio_map)} audio files")
    print()

    # Analyze each resource
    resources_data = []
    for path in resource_files:
        resource = load_resource(path)
        if "error" not in resource:
            stats = analyze_resource_completeness(resource)
            resources_data.append({
                "path": str(path.relative_to(BASE_DIR)),
                "data": resource,
                "stats": stats
            })

    print(f"Analyzed {len(resources_data)} resources")
    print()

    # Categorize resources
    categories = categorize_resources(resources_data)
    print(f"Identified {len(categories)} distinct categories/tags")
    print()

    # Generate reports
    print("Generating audit report...")
    report = generate_report(resources_data, audio_map, categories)

    # Save report
    report_path = BASE_DIR / "docs" / "CONTENT_AUDIT_REPORT.txt"
    report_path.parent.mkdir(exist_ok=True)
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"Report saved to: {report_path}")

    # Generate CSV inventory
    csv_path = BASE_DIR / "docs" / "CONTENT_INVENTORY.csv"
    generate_csv_inventory(resources_data, csv_path)
    print(f"CSV inventory saved to: {csv_path}")

    # Print report to console
    print()
    print(report)

if __name__ == "__main__":
    main()
