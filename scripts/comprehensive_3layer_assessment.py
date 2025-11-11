#!/usr/bin/env python3
"""
3-Layer Resource Assessment Tool
Analyzes alignment between:
- Layer 1: Website descriptions (promises)
- Layer 2: Source content files (actual content)
- Layer 3: Audio MP3 files (generated audio)
"""

import json
import os
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# Base paths
BASE_DIR = Path("/mnt/c/Users/brand/Development/Project_Workspace/active-development/hablas")
PUBLIC_AUDIO = BASE_DIR / "public" / "audio"
DOCS_DIR = BASE_DIR / "docs"

class ResourceAnalyzer:
    def __init__(self):
        self.resources = []
        self.perfect_alignment = []
        self.website_over_source = []
        self.source_over_audio = []
        self.audio_over_source = []
        self.missing_files = []

    def count_phrases_in_markdown(self, filepath):
        """Count phrases in markdown files"""
        if not os.path.exists(filepath):
            return 0, "File not found"

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Count various phrase patterns
            patterns = [
                r'^###\s+Frase\s+\d+:',  # ### Frase 1:
                r'^###\s+\d+\.',          # ### 1.
                r'^\*\*Frase\s+\d+',      # **Frase 1
            ]

            counts = []
            for pattern in patterns:
                matches = re.findall(pattern, content, re.MULTILINE | re.IGNORECASE)
                counts.append(len(matches))

            max_count = max(counts) if counts else 0
            return max_count, "Success"
        except Exception as e:
            return 0, f"Error: {str(e)}"

    def count_phrases_in_audio_script(self, filepath):
        """Count phrases in audio script .txt files"""
        if not os.path.exists(filepath):
            return 0, "File not found"

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Count FRASE markers
            count = len(re.findall(r'FRASE\s+\d+', content, re.IGNORECASE))
            return count, "Success"
        except Exception as e:
            return 0, f"Error: {str(e)}"

    def get_audio_info(self, resource_id):
        """Get audio file information"""
        audio_file = PUBLIC_AUDIO / f"resource-{resource_id}.mp3"

        if not audio_file.exists():
            return {
                'exists': False,
                'size_bytes': 0,
                'size_mb': 0,
                'estimated_phrases': 0
            }

        size_bytes = audio_file.stat().st_size
        size_mb = size_bytes / (1024 * 1024)

        # Estimate phrases: ~100-150KB per phrase for bilingual audio
        estimated_phrases = int(size_bytes / 125000)

        return {
            'exists': True,
            'size_bytes': size_bytes,
            'size_mb': round(size_mb, 2),
            'estimated_phrases': estimated_phrases
        }

    def extract_promised_count(self, description, title):
        """Extract promised phrase count from description/title"""
        text = f"{description} {title}".lower()

        # Look for patterns like "30 frases", "25 phrases", etc.
        patterns = [
            r'(\d+)\s+frases',
            r'(\d+)\s+phrases',
            r'(\d+)\s+scenarios',
        ]

        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return int(match.group(1))

        return None  # No specific promise found

    def analyze_resource(self, resource_data):
        """Analyze a single resource across all 3 layers"""
        resource_id = resource_data['id']
        title = resource_data['title']
        description = resource_data['description']
        content_path_raw = resource_data.get('contentPath', '')

        # Convert Windows path to WSL path
        if content_path_raw:
            content_path = content_path_raw.replace('C:\\', '/mnt/c/').replace('\\', '/')
        else:
            content_path = None

        # Layer 1: Website promise
        promised_count = self.extract_promised_count(description, title)

        # Layer 2: Source content
        if content_path and os.path.exists(content_path):
            if content_path.endswith('.md'):
                actual_count, status = self.count_phrases_in_markdown(content_path)
            elif content_path.endswith('.txt'):
                actual_count, status = self.count_phrases_in_audio_script(content_path)
            else:
                actual_count, status = 0, "Unknown file type"
            source_exists = True
        else:
            actual_count = 0
            status = "Source file not found"
            source_exists = False

        # Layer 3: Audio
        audio_info = self.get_audio_info(resource_id)

        # Categorize alignment
        result = {
            'id': resource_id,
            'title': title,
            'description': description,
            'layer1_promise': promised_count,
            'layer2_actual': actual_count,
            'layer2_exists': source_exists,
            'layer3_audio_exists': audio_info['exists'],
            'layer3_estimated': audio_info['estimated_phrases'],
            'layer3_size_mb': audio_info['size_mb'],
            'content_path': content_path,
            'status': status
        }

        # Determine category
        if not source_exists:
            result['category'] = 'MISSING_SOURCE'
            self.missing_files.append(result)
        elif not audio_info['exists']:
            result['category'] = 'MISSING_AUDIO'
            self.missing_files.append(result)
        elif promised_count and actual_count and audio_info['estimated_phrases']:
            # All three layers have data - check alignment
            if promised_count == actual_count == audio_info['estimated_phrases']:
                result['category'] = 'PERFECT_ALIGNMENT'
                self.perfect_alignment.append(result)
            elif promised_count > actual_count:
                result['category'] = 'WEBSITE_OVER_SOURCE'
                self.website_over_source.append(result)
            elif actual_count > audio_info['estimated_phrases']:
                result['category'] = 'SOURCE_OVER_AUDIO'
                self.source_over_audio.append(result)
            elif audio_info['estimated_phrases'] > actual_count:
                result['category'] = 'AUDIO_OVER_SOURCE'
                self.audio_over_source.append(result)
            else:
                result['category'] = 'ALIGNED'
                self.perfect_alignment.append(result)
        else:
            result['category'] = 'NO_PROMISE_DATA'
            result['note'] = 'No specific phrase count promised'

        self.resources.append(result)
        return result

    def generate_markdown_report(self):
        """Generate comprehensive markdown report"""
        report = []
        report.append("# 3-Layer Resource Assessment Report")
        report.append(f"\n**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"**Total Resources Analyzed:** {len(self.resources)}")
        report.append("\n---\n")

        # Executive Summary
        report.append("## Executive Summary\n")
        report.append(f"- **Perfect Alignment:** {len(self.perfect_alignment)} resources")
        report.append(f"- **Website Promise > Source:** {len(self.website_over_source)} resources")
        report.append(f"- **Source > Audio:** {len(self.source_over_audio)} resources")
        report.append(f"- **Audio > Source:** {len(self.audio_over_source)} resources")
        report.append(f"- **Missing Files:** {len(self.missing_files)} resources")
        report.append("\n---\n")

        # Perfect Alignment
        if self.perfect_alignment:
            report.append("## ✅ PERFECT ALIGNMENT (All 3 layers match)\n")
            for r in self.perfect_alignment:
                report.append(f"### Resource {r['id']}: {r['title']}")
                report.append(f"- Website Promise: {r['layer1_promise']} phrases")
                report.append(f"- Source Content: {r['layer2_actual']} phrases")
                report.append(f"- Audio Estimated: {r['layer3_estimated']} phrases")
                report.append(f"- Audio Size: {r['layer3_size_mb']} MB")
                report.append("")

        # Website Over Source
        if self.website_over_source:
            report.append("## ⚠️ WEBSITE PROMISE > SOURCE (False advertising)\n")
            for r in self.website_over_source:
                report.append(f"### Resource {r['id']}: {r['title']}")
                report.append(f"- Website Promise: {r['layer1_promise']} phrases")
                report.append(f"- Source Content: {r['layer2_actual']} phrases ❌")
                report.append(f"- Audio Estimated: {r['layer3_estimated']} phrases")
                report.append(f"- **FIX:** Either complete source OR update website description")
                report.append("")

        # Source Over Audio
        if self.source_over_audio:
            report.append("## ⚠️ SOURCE > AUDIO (Incomplete audio generation)\n")
            for r in self.source_over_audio:
                report.append(f"### Resource {r['id']}: {r['title']}")
                report.append(f"- Website Promise: {r['layer1_promise'] or 'N/A'}")
                report.append(f"- Source Content: {r['layer2_actual']} phrases")
                report.append(f"- Audio Estimated: {r['layer3_estimated']} phrases ❌")
                report.append(f"- **FIX:** Regenerate audio from complete source")
                report.append("")

        # Audio Over Source
        if self.audio_over_source:
            report.append("## ⚠️ AUDIO > SOURCE (Audio has extra/wrong content)\n")
            for r in self.audio_over_source:
                report.append(f"### Resource {r['id']}: {r['title']}")
                report.append(f"- Website Promise: {r['layer1_promise'] or 'N/A'}")
                report.append(f"- Source Content: {r['layer2_actual']} phrases")
                report.append(f"- Audio Estimated: {r['layer3_estimated']} phrases ❌")
                report.append(f"- **FIX:** Regenerate audio from correct source")
                report.append("")

        # Missing Files
        if self.missing_files:
            report.append("## 🚨 MISSING FILES\n")
            for r in self.missing_files:
                report.append(f"### Resource {r['id']}: {r['title']}")
                report.append(f"- Source Exists: {r['layer2_exists']}")
                report.append(f"- Audio Exists: {r['layer3_audio_exists']}")
                report.append(f"- Status: {r['status']}")
                report.append("")

        return "\n".join(report)

    def generate_json_report(self):
        """Generate machine-readable JSON report"""
        return {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_resources': len(self.resources),
                'perfect_alignment': len(self.perfect_alignment),
                'website_over_source': len(self.website_over_source),
                'source_over_audio': len(self.source_over_audio),
                'audio_over_source': len(self.audio_over_source),
                'missing_files': len(self.missing_files)
            },
            'resources': self.resources,
            'categories': {
                'perfect_alignment': [r['id'] for r in self.perfect_alignment],
                'website_over_source': [r['id'] for r in self.website_over_source],
                'source_over_audio': [r['id'] for r in self.source_over_audio],
                'audio_over_source': [r['id'] for r in self.audio_over_source],
                'missing_files': [r['id'] for r in self.missing_files]
            }
        }

    def generate_fixes_prioritized(self):
        """Generate prioritized fix list"""
        fixes = []

        # Priority 1: Missing files (blocker)
        for r in self.missing_files:
            fixes.append({
                'priority': 1,
                'severity': 'CRITICAL',
                'resource_id': r['id'],
                'title': r['title'],
                'issue': 'Missing source or audio file',
                'action': 'Create missing file' if not r['layer2_exists'] else 'Generate audio',
                'details': r['status']
            })

        # Priority 2: Website promise > source (false advertising)
        for r in self.website_over_source:
            fixes.append({
                'priority': 2,
                'severity': 'HIGH',
                'resource_id': r['id'],
                'title': r['title'],
                'issue': f"Website promises {r['layer1_promise']} but source has {r['layer2_actual']}",
                'action': f"Either add {r['layer1_promise'] - r['layer2_actual']} phrases OR update description",
                'details': 'User expectation mismatch'
            })

        # Priority 3: Source > audio (incomplete generation)
        for r in self.source_over_audio:
            fixes.append({
                'priority': 3,
                'severity': 'MEDIUM',
                'resource_id': r['id'],
                'title': r['title'],
                'issue': f"Source has {r['layer2_actual']} but audio only {r['layer3_estimated']}",
                'action': 'Regenerate complete audio from source',
                'details': 'Incomplete audio generation'
            })

        # Priority 4: Audio > source (wrong content)
        for r in self.audio_over_source:
            fixes.append({
                'priority': 4,
                'severity': 'MEDIUM',
                'resource_id': r['id'],
                'title': r['title'],
                'issue': f"Audio has {r['layer3_estimated']} but source only {r['layer2_actual']}",
                'action': 'Regenerate audio from correct source',
                'details': 'Audio content mismatch'
            })

        # Sort by priority
        fixes.sort(key=lambda x: (x['priority'], x['resource_id']))

        return fixes

def main():
    # Load resources from resources.ts
    resources_ts_path = BASE_DIR / "data" / "resources.ts"

    print("Loading resources from resources.ts...")
    with open(resources_ts_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract JSON objects from TypeScript
    # Find all objects between { and }
    import re
    pattern = r'\{[^{}]*"id":\s*(\d+)[^{}]*\}'

    # More sophisticated extraction
    resources = []
    current_obj = ""
    brace_count = 0
    in_object = False

    for line in content.split('\n'):
        if '{' in line and '"id"' in line:
            in_object = True
            current_obj = line
            brace_count = line.count('{') - line.count('}')
        elif in_object:
            current_obj += '\n' + line
            brace_count += line.count('{') - line.count('}')

            if brace_count == 0:
                # Try to parse this object
                try:
                    # Clean up the object string
                    obj_str = current_obj.strip()
                    if obj_str.endswith(','):
                        obj_str = obj_str[:-1]

                    # Convert TypeScript to JSON
                    obj_str = re.sub(r'(\w+):', r'"\1":', obj_str)
                    obj_str = re.sub(r':\s*"([^"]*)"', r': "\1"', obj_str)

                    # Try to extract key fields manually
                    id_match = re.search(r'"id":\s*(\d+)', current_obj)
                    title_match = re.search(r'"title":\s*"([^"]*)"', current_obj)
                    desc_match = re.search(r'"description":\s*"([^"]*)"', current_obj)
                    content_path_match = re.search(r'"contentPath":\s*"([^"]*)"', current_obj)

                    if id_match and title_match:
                        resource = {
                            'id': int(id_match.group(1)),
                            'title': title_match.group(1) if title_match else '',
                            'description': desc_match.group(1) if desc_match else '',
                            'contentPath': content_path_match.group(1) if content_path_match else ''
                        }
                        resources.append(resource)
                except Exception as e:
                    print(f"Warning: Could not parse object: {str(e)[:100]}")

                in_object = False
                current_obj = ""

    print(f"Found {len(resources)} resources to analyze")

    # Analyze all resources
    analyzer = ResourceAnalyzer()
    for resource in resources:
        print(f"Analyzing Resource {resource['id']}...")
        analyzer.analyze_resource(resource)

    # Generate reports
    print("\nGenerating reports...")

    # Markdown report
    md_report = analyzer.generate_markdown_report()
    md_path = DOCS_DIR / "3-LAYER-ASSESSMENT-REPORT.md"
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(md_report)
    print(f"✅ Markdown report: {md_path}")

    # JSON report
    json_report = analyzer.generate_json_report()
    json_path = DOCS_DIR / "assessment-3-layer.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(json_report, f, indent=2, ensure_ascii=False)
    print(f"✅ JSON report: {json_path}")

    # Prioritized fixes
    fixes = analyzer.generate_fixes_prioritized()
    fixes_path = DOCS_DIR / "fixes-prioritized.json"
    with open(fixes_path, 'w', encoding='utf-8') as f:
        json.dump(fixes, f, indent=2, ensure_ascii=False)
    print(f"✅ Prioritized fixes: {fixes_path}")

    # Print summary
    print("\n" + "="*60)
    print("ASSESSMENT COMPLETE")
    print("="*60)
    print(f"Total Resources: {len(analyzer.resources)}")
    print(f"Perfect Alignment: {len(analyzer.perfect_alignment)}")
    print(f"Website > Source: {len(analyzer.website_over_source)}")
    print(f"Source > Audio: {len(analyzer.source_over_audio)}")
    print(f"Audio > Source: {len(analyzer.audio_over_source)}")
    print(f"Missing Files: {len(analyzer.missing_files)}")
    print("="*60)

if __name__ == "__main__":
    main()
