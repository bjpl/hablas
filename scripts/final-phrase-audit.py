#!/usr/bin/env python3
"""
Comprehensive Phrase Coverage Audit
Analyzes phrase coverage for all resources
"""

import json
import re
import os
from pathlib import Path

def count_phrases_in_markdown(filepath):
    """Count phrases marked with '### Frase X:' in markdown"""
    if not os.path.exists(filepath):
        return 0
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        # Count '### Frase X:' markers
        matches = re.findall(r'^### Frase \d+:', content, re.MULTILINE)
        return len(matches)

def count_extracted_phrases(resource_id):
    """Count phrases in extraction file"""
    filepath = f"scripts/final-phrases-only/resource-{resource_id}.txt"
    if not os.path.exists(filepath):
        return 0
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        # Format: 6 lines per phrase (EN, EN, ES, blank, blank, blank)
        return len(lines) // 6

def parse_resources_ts():
    """Parse resources.ts to extract resource mappings"""
    resources = []
    
    with open('data/resources.ts', 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Extract each resource object
    # Look for patterns like "id": X, ... "downloadUrl": "path"
    pattern = r'"id":\s*(\d+),.*?"downloadUrl":\s*"([^"]+)"'
    matches = re.findall(pattern, content, re.DOTALL)
    
    for match in matches:
        resource_id = int(match[0])
        download_url = match[1]
        
        # Convert URL to file path (remove leading /)
        if download_url.startswith('/'):
            download_url = download_url[1:]
        
        resources.append({
            'id': resource_id,
            'download_url': download_url
        })
    
    return resources

def main():
    print("=== COMPREHENSIVE PHRASE COVERAGE AUDIT ===\n")
    
    resources = parse_resources_ts()
    
    incomplete_resources = []
    complete_resources = []
    missing_sources = []
    missing_extractions = []
    
    total_missing_phrases = 0
    
    for resource in resources:
        res_id = resource['id']
        source_path = resource['download_url']
        
        # Only process markdown files (not audio scripts or images)
        if not source_path.endswith('.md') or 'image-spec' in source_path or 'audio-script' in source_path:
            continue
        
        # Count phrases in source
        md_count = count_phrases_in_markdown(source_path)
        
        # Count extracted phrases
        extracted_count = count_extracted_phrases(res_id)
        
        # Determine status
        if md_count == 0:
            if extracted_count > 0:
                print(f"Resource {res_id}: Has {extracted_count} extracted phrases but NO SOURCE MARKDOWN")
                missing_sources.append((res_id, extracted_count))
            else:
                print(f"Resource {res_id}: MISSING both source and extraction")
                missing_extractions.append(res_id)
        elif extracted_count == 0:
            print(f"Resource {res_id}: Has {md_count} phrases in markdown but NO EXTRACTION")
            incomplete_resources.append((res_id, md_count, 0))
            total_missing_phrases += md_count
        elif extracted_count < md_count:
            missing = md_count - extracted_count
            coverage = int((extracted_count / md_count) * 100)
            print(f"Resource {res_id}: INCOMPLETE - {extracted_count}/{md_count} phrases ({coverage}% coverage, missing {missing})")
            incomplete_resources.append((res_id, md_count, extracted_count))
            total_missing_phrases += missing
        else:
            print(f"Resource {res_id}: COMPLETE - {extracted_count} phrases (100%+ coverage)")
            complete_resources.append((res_id, extracted_count))
    
    # Generate report
    print("\n=== AUDIT SUMMARY ===")
    print(f"Complete Resources: {len(complete_resources)}")
    print(f"Incomplete Resources: {len(incomplete_resources)}")
    print(f"Missing Sources: {len(missing_sources)}")
    print(f"Missing Extractions: {len(missing_extractions)}")
    print(f"Total Missing Phrases: {total_missing_phrases}")
    
    # Write detailed report
    with open('docs/audit/PHRASE_COVERAGE_FINAL_AUDIT.md', 'w', encoding='utf-8') as f:
        f.write("# Complete Phrase Coverage Audit Report\n\n")
        f.write(f"**Audit Date:** {os.popen('date').read().strip()}\n")
        f.write("**Auditor:** PhraseCoverageAuditor Agent\n\n")
        
        f.write("## Executive Summary\n\n")
        f.write(f"- **Complete Resources:** {len(complete_resources)}\n")
        f.write(f"- **Incomplete Resources:** {len(incomplete_resources)}\n")
        f.write(f"- **Total Missing Phrases:** {total_missing_phrases}\n\n")
        
        f.write("## Resources with INCOMPLETE Coverage\n\n")
        for res_id, md_count, extracted in incomplete_resources:
            missing = md_count - extracted
            coverage = int((extracted / md_count) * 100) if md_count > 0 else 0
            f.write(f"- **Resource {res_id}**: {extracted}/{md_count} phrases ({coverage}% coverage) - **MISSING {missing} PHRASES**\n")
        
        f.write("\n## Resources with COMPLETE Coverage\n\n")
        for res_id, count in complete_resources:
            f.write(f"- Resource {res_id}: {count} phrases\n")
        
        f.write("\n## Action Plan\n\n")
        f.write("### Priority 1: Resources Needing Regeneration\n\n")
        for res_id, md_count, extracted in incomplete_resources:
            f.write(f"- [ ] Resource {res_id} (needs {md_count - extracted} additional phrases)\n")
        
        f.write(f"\n### Estimated Work\n\n")
        f.write(f"- **Resources to Regenerate:** {len(incomplete_resources)}\n")
        f.write(f"- **Total Missing Phrases:** {total_missing_phrases}\n")
        f.write(f"- **Estimated Time:** ~{total_missing_phrases // 2} minutes (at 30 seconds per phrase)\n")
    
    print("\nFull report saved to: docs/audit/PHRASE_COVERAGE_FINAL_AUDIT.md")

if __name__ == '__main__':
    main()
