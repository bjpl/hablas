#!/usr/bin/env python3
"""
COMPREHENSIVE CONTENT AUDIT - ALL 59 RESOURCES
Analyzes resources.ts data structure for completeness, audio mappings, and gaps
"""

import json
import re
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple

BASE_DIR = Path("C:/Users/brand/Development/Project_Workspace/active-development/hablas")
AUDIO_DIR = BASE_DIR / "public" / "audio"
DATA_JSON_DIR = BASE_DIR / "data" / "resources"

# Parse resources from resources.ts
def parse_resources_ts() -> List[Dict]:
    """Extract all 59 resources from resources.ts"""
    resources_file = BASE_DIR / "data" / "resources.ts"
    with open(resources_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the resources array
    match = re.search(r'export const resources: Resource\[\] = \[(.*)\]', content, re.DOTALL)
    if not match:
        raise ValueError("Could not find resources array")

    array_content = match.group(1)

    # Parse JSON objects (they're already in JSON format)
    resources = []
    # Split by },\n  { pattern to separate objects
    objects = re.split(r'\},\s*\n\s*\{', array_content)

    for i, obj_str in enumerate(objects):
        # Add back the braces
        if not obj_str.strip().startswith('{'):
            obj_str = '{' + obj_str
        if not obj_str.strip().endswith('}'):
            obj_str = obj_str + '}'

        # Remove trailing comma and comments
        obj_str = re.sub(r',\s*}', '}', obj_str)
        obj_str = re.sub(r'//.*$', '', obj_str, flags=re.MULTILINE)

        try:
            resource = json.loads(obj_str)
            resources.append(resource)
        except json.JSONDecodeError as e:
            print(f"Warning: Could not parse resource {i+1}: {e}")
            continue

    return resources

def get_audio_files() -> Dict[str, Path]:
    """Map audio filenames to paths"""
    audio_map = {}
    if AUDIO_DIR.exists():
        for audio_file in AUDIO_DIR.glob("*.mp3"):
            audio_map[audio_file.name] = audio_file
            # Also map without extension
            audio_map[audio_file.stem] = audio_file
    return audio_map

def analyze_resource(resource: Dict, audio_map: Dict) -> Dict:
    """Analyze a single resource for completeness"""
    issues = []
    warnings = []

    # Check required fields
    required = ['id', 'title', 'description', 'type', 'category', 'level', 'downloadUrl', 'tags', 'offline']
    for field in required:
        if field not in resource:
            issues.append(f"Missing required field: {field}")
        elif not resource.get(field):
            issues.append(f"Empty required field: {field}")

    # Check audio URL
    has_audio_url = 'audioUrl' in resource and resource['audioUrl']
    audio_file_exists = False

    if has_audio_url:
        audio_filename = resource['audioUrl'].split('/')[-1]
        audio_file_exists = audio_filename in audio_map
        if not audio_file_exists:
            warnings.append(f"audioUrl specified but file not found: {audio_filename}")

    # Check content path
    content_exists = False
    if 'contentPath' in resource:
        content_path = Path(resource['contentPath'])
        content_exists = content_path.exists()
        if not content_exists:
            warnings.append(f"contentPath specified but file not found")

    return {
        'issues': issues,
        'warnings': warnings,
        'has_audio_url': has_audio_url,
        'audio_file_exists': audio_file_exists,
        'content_exists': content_exists,
        'tags_count': len(resource.get('tags', [])),
    }

def categorize_resources(resources: List[Dict]) -> Dict:
    """Categorize resources by various dimensions"""
    categories = {
        'by_category': defaultdict(list),
        'by_level': defaultdict(list),
        'by_type': defaultdict(list),
        'with_audio_url': [],
        'without_audio_url': [],
        'emergency': [],
        'platform_specific': []
    }

    for res in resources:
        res_id = res['id']
        categories['by_category'][res.get('category', 'unknown')].append(res_id)
        categories['by_level'][res.get('level', 'unknown')].append(res_id)
        categories['by_type'][res.get('type', 'unknown')].append(res_id)

        # Audio resources
        if 'audioUrl' in res:
            categories['with_audio_url'].append(res_id)
        else:
            categories['without_audio_url'].append(res_id)

        # Advanced resources
        tags_str = ' '.join(res.get('tags', [])).lower()
        if 'emergency' in tags_str or 'emergencia' in res.get('description', '').lower():
            categories['emergency'].append(res_id)
        if 'app-specific' in tags_str or res.get('category') == 'conductor':
            categories['platform_specific'].append(res_id)

    return categories

def identify_gaps(resources: List[Dict], categories: Dict) -> List[str]:
    """Identify content coverage gaps"""
    gaps = []

    # Check category balance
    by_category = categories['by_category']
    total = len(resources)

    for cat, ids in by_category.items():
        count = len(ids)
        percentage = (count / total) * 100
        if percentage < 15:
            gaps.append(f"Category '{cat}' has only {count} resources ({percentage:.1f}% coverage)")

    # Check audio coverage
    without_audio = len(categories.get('without_audio_url', []))
    if without_audio > 0:
        gaps.append(f"{without_audio} resources lack audioUrl field ({(without_audio/total)*100:.1f}%)")

    # Check level distribution
    by_level = categories['by_level']
    for level in ['basico', 'intermedio', 'avanzado']:
        count = len(by_level.get(level, []))
        if count < 10:
            gaps.append(f"Level '{level}' has only {count} resources")

    # Check resource types
    by_type = categories['by_type']
    audio_resources = len(by_type.get('audio', []))
    if audio_resources < 9:
        gaps.append(f"Only {audio_resources} dedicated audio resources (expected 9+)")

    # Check platform-specific content
    conductor_count = len(by_category.get('conductor', []))
    repartidor_count = len(by_category.get('repartidor', []))

    if abs(conductor_count - repartidor_count) > 10:
        gaps.append(f"Imbalanced audience: {conductor_count} conductor vs {repartidor_count} repartidor resources")

    return gaps

def generate_detailed_report(resources: List[Dict], audio_map: Dict, categories: Dict, gaps: List[str]) -> str:
    """Generate comprehensive audit report"""
    report = []
    report.append("=" * 100)
    report.append("HABLAS PLATFORM - COMPREHENSIVE CONTENT AUDIT REPORT")
    report.append("=" * 100)
    report.append(f"Audit Date: 2025-11-02")
    report.append(f"Total Resources Analyzed: {len(resources)}")
    report.append(f"Total Audio Files Available: {len(audio_map)}")
    report.append("")

    # Analyze all resources
    all_analyses = []
    for res in resources:
        analysis = analyze_resource(res, audio_map)
        all_analyses.append({
            'resource': res,
            'analysis': analysis
        })

    # Executive Summary
    report.append("EXECUTIVE SUMMARY")
    report.append("-" * 100)

    resources_with_audio = sum(1 for a in all_analyses if a['analysis']['has_audio_url'])
    resources_with_issues = sum(1 for a in all_analyses if a['analysis']['issues'])
    resources_with_warnings = sum(1 for a in all_analyses if a['analysis']['warnings'])
    audio_files_exist = sum(1 for a in all_analyses if a['analysis']['audio_file_exists'])

    report.append(f"Total Resources: {len(resources)}")
    report.append(f"Resources with audioUrl field: {resources_with_audio} ({(resources_with_audio/len(resources))*100:.1f}%)")
    report.append(f"Audio files that exist on disk: {audio_files_exist}")
    report.append(f"Resources WITHOUT audioUrl: {len(resources) - resources_with_audio}")
    report.append(f"Resources with CRITICAL issues: {resources_with_issues}")
    report.append(f"Resources with warnings: {resources_with_warnings}")
    report.append("")

    # Category Breakdown
    report.append("CATEGORY DISTRIBUTION")
    report.append("-" * 100)

    for dimension in ['by_category', 'by_level', 'by_type']:
        if dimension in categories:
            report.append(f"\n{dimension.replace('by_', '').upper()}:")
            for key, ids in sorted(categories[dimension].items(), key=lambda x: len(x[1]), reverse=True):
                count = len(ids)
                percentage = (count / len(resources)) * 100
                report.append(f"  {key:15s}: {count:3d} resources ({percentage:5.1f}%)")
    report.append("")

    # Audio Coverage Analysis
    report.append("AUDIO COVERAGE ANALYSIS")
    report.append("-" * 100)
    report.append(f"Audio files in /public/audio/: {len(audio_map)}")
    report.append(f"Resources with audioUrl field: {resources_with_audio}")
    report.append(f"Audio files that actually exist: {audio_files_exist}")
    report.append("")

    # List all audio files
    report.append("Available Audio Files:")
    for filename in sorted(audio_map.keys()):
        if filename.endswith('.mp3'):
            report.append(f"  - {filename}")
    report.append("")

    # Resources WITHOUT Audio
    report.append("RESOURCES WITHOUT AUDIO (22 resources)")
    report.append("-" * 100)

    no_audio_resources = [a for a in all_analyses if not a['analysis']['has_audio_url']]
    report.append(f"Total: {len(no_audio_resources)} resources need audioUrl field\n")

    for item in no_audio_resources:
        res = item['resource']
        report.append(f"[ID {res['id']:2d}] {res['title']}")
        report.append(f"        Category: {res['category']:12s} | Level: {res['level']:10s} | Type: {res['type']}")
        report.append(f"        Tags: {', '.join(res.get('tags', [])[:4])}")
        report.append("")

    # Resources WITH Audio (verify files exist)
    report.append("RESOURCES WITH AUDIO URL")
    report.append("-" * 100)

    with_audio = [a for a in all_analyses if a['analysis']['has_audio_url']]
    report.append(f"Total: {len(with_audio)} resources have audioUrl field\n")

    for item in with_audio[:10]:  # Show first 10
        res = item['resource']
        exists = "✓ EXISTS" if item['analysis']['audio_file_exists'] else "✗ MISSING"
        report.append(f"[ID {res['id']:2d}] {res['title']}")
        report.append(f"        Audio: {res.get('audioUrl', 'N/A')} - {exists}")
        report.append("")

    if len(with_audio) > 10:
        report.append(f"... and {len(with_audio) - 10} more resources with audio")
        report.append("")

    # Critical Issues
    report.append("CRITICAL ISSUES")
    report.append("-" * 100)

    with_issues = [a for a in all_analyses if a['analysis']['issues']]
    if with_issues:
        for item in with_issues:
            res = item['resource']
            report.append(f"[ID {res['id']:2d}] {res['title']}")
            for issue in item['analysis']['issues']:
                report.append(f"        ERROR: {issue}")
            report.append("")
    else:
        report.append("✓ No critical issues found!\n")

    # Warnings
    report.append("WARNINGS")
    report.append("-" * 100)

    with_warnings = [a for a in all_analyses if a['analysis']['warnings']]
    if with_warnings:
        for item in with_warnings[:15]:  # Limit to 15
            res = item['resource']
            report.append(f"[ID {res['id']:2d}] {res['title']}")
            for warning in item['analysis']['warnings']:
                report.append(f"        WARNING: {warning}")
            report.append("")
        if len(with_warnings) > 15:
            report.append(f"... and {len(with_warnings) - 15} more warnings")
            report.append("")
    else:
        report.append("✓ No warnings!\n")

    # Content Gaps
    report.append("CONTENT GAPS & RECOMMENDATIONS")
    report.append("-" * 100)

    if gaps:
        for i, gap in enumerate(gaps, 1):
            report.append(f"{i:2d}. {gap}")
        report.append("")
    else:
        report.append("✓ No significant gaps identified!\n")

    # Priority Recommendations
    report.append("PRIORITY RECOMMENDATIONS")
    report.append("-" * 100)
    report.append("")
    report.append("HIGH PRIORITY:")
    report.append(f"  1. Add audioUrl field to {len(no_audio_resources)} resources without audio")
    report.append(f"  2. Generate MP3 files for resources with audioUrl but missing files")
    if resources_with_issues > 0:
        report.append(f"  3. Fix {resources_with_issues} resources with critical field issues")
    report.append("")

    report.append("MEDIUM PRIORITY:")
    report.append("  1. Balance content across categories (especially repartidor vs conductor)")
    report.append("  2. Ensure all levels (basico/intermedio/avanzado) have sufficient coverage")
    report.append("  3. Add more dedicated audio resources (currently only 9)")
    report.append("")

    report.append("LOW PRIORITY:")
    report.append("  1. Enhance tag consistency across resources")
    report.append("  2. Add more visual (image) resources")
    report.append("  3. Consider adding video resources for complex topics")
    report.append("")

    # Audio File Mapping
    report.append("AUDIO FILE MAPPING TABLE")
    report.append("-" * 100)
    report.append(f"{'ID':<5} {'Audio Filename':<30} {'Status':<10} {'Resource Title'}")
    report.append("-" * 100)

    for item in sorted(all_analyses, key=lambda x: x['resource']['id']):
        res = item['resource']
        if item['analysis']['has_audio_url']:
            audio_file = res['audioUrl'].split('/')[-1]
            status = "EXISTS" if item['analysis']['audio_file_exists'] else "MISSING"
            report.append(f"{res['id']:<5} {audio_file:<30} {status:<10} {res['title'][:50]}")
    report.append("")

    report.append("=" * 100)
    report.append("END OF COMPREHENSIVE AUDIT REPORT")
    report.append("=" * 100)

    return "\n".join(report)

def generate_csv_report(resources: List[Dict], audio_map: Dict) -> str:
    """Generate CSV format report"""
    import csv
    import io

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        'ID', 'Title', 'Category', 'Level', 'Type', 'Has_AudioUrl',
        'Audio_Exists', 'Tags_Count', 'Size', 'Offline'
    ])

    # Data
    for res in sorted(resources, key=lambda x: x['id']):
        analysis = analyze_resource(res, audio_map)
        writer.writerow([
            res['id'],
            res['title'],
            res.get('category', ''),
            res.get('level', ''),
            res.get('type', ''),
            'Yes' if analysis['has_audio_url'] else 'No',
            'Yes' if analysis['audio_file_exists'] else 'No',
            analysis['tags_count'],
            res.get('size', ''),
            'Yes' if res.get('offline') else 'No'
        ])

    return output.getvalue()

def main():
    print("Starting comprehensive content audit...")
    print(f"Base directory: {BASE_DIR}")
    print()

    # Parse resources
    print("Parsing resources.ts...")
    resources = parse_resources_ts()
    print(f"Found {len(resources)} resources")

    # Get audio files
    print("Checking audio files...")
    audio_map = get_audio_files()
    print(f"Found {len(audio_map)} audio file mappings")
    print()

    # Categorize
    print("Categorizing resources...")
    categories = categorize_resources(resources)

    # Identify gaps
    print("Identifying content gaps...")
    gaps = identify_gaps(resources, categories)
    print(f"Identified {len(gaps)} content gaps")
    print()

    # Generate report
    print("Generating comprehensive report...")
    report = generate_detailed_report(resources, audio_map, categories, gaps)

    # Save report
    report_path = BASE_DIR / "docs" / "COMPREHENSIVE_AUDIT_REPORT.txt"
    report_path.parent.mkdir(exist_ok=True)
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"Report saved to: {report_path}")

    # Generate CSV
    csv_data = generate_csv_report(resources, audio_map)
    csv_path = BASE_DIR / "docs" / "RESOURCE_COMPLETENESS_MATRIX.csv"
    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        f.write(csv_data)
    print(f"CSV matrix saved to: {csv_path}")

    # Print report to console
    print()
    print(report)

if __name__ == "__main__":
    main()
