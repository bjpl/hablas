#!/usr/bin/env python3
"""
Formatting Standards Audit for Phrase Scripts
Checks: E1 (structure), E2 (punctuation), E3 (UTF-8), E7 (translation), C1 (production notes)
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple
from datetime import datetime

class FormatAuditor:
    def __init__(self):
        self.issues = []
        self.results = {}

    def check_e1_structure(self, content: str, filename: str) -> List[Dict]:
        """Check structure consistency"""
        issues = []
        lines = content.split('\n')

        # Check for proper heading structure
        if filename.endswith('.md'):
            heading_count = 0
            for idx, line in enumerate(lines, 1):
                if line.startswith('#'):
                    heading_count += 1
                    level = len(line) - len(line.lstrip('#'))
                    if level > 3 and heading_count == 1:
                        issues.append({
                            'file': filename,
                            'standard': 'E1',
                            'line': idx,
                            'issue': f'First heading should be level 1-2, found level {level}',
                            'severity': 'warning'
                        })

        # Check consistent spacing (max 2 blank lines)
        blank_count = 0
        for idx, line in enumerate(lines, 1):
            if line.strip() == '':
                blank_count += 1
                if blank_count > 2:
                    issues.append({
                        'file': filename,
                        'standard': 'E1',
                        'line': idx,
                        'issue': 'More than 2 consecutive blank lines',
                        'severity': 'warning'
                    })
                    blank_count = 0
            else:
                blank_count = 0

        return issues

    def check_e2_punctuation(self, content: str, filename: str) -> List[Dict]:
        """Check punctuation & capitalization"""
        issues = []
        lines = content.split('\n')

        for idx, line in enumerate(lines, 1):
            if not line.strip() or line.startswith('```') or line.startswith('    '):
                continue

            # Mixed quotes
            single_quotes = line.count("'")
            double_quotes = line.count('"')
            if single_quotes > 0 and double_quotes > 0 and len(line) < 100:
                issues.append({
                    'file': filename,
                    'standard': 'E2',
                    'line': idx,
                    'issue': 'Mixed quote types in single line',
                    'severity': 'info'
                })

            # Lowercase after period
            if re.search(r'\.\s+[a-z]', line):
                issues.append({
                    'file': filename,
                    'standard': 'E2',
                    'line': idx,
                    'issue': 'Lowercase after period detected',
                    'severity': 'warning'
                })

            # Trailing whitespace
            if line != line.rstrip():
                issues.append({
                    'file': filename,
                    'standard': 'E2',
                    'line': idx,
                    'issue': 'Trailing whitespace',
                    'severity': 'info'
                })

        return issues

    def check_e3_encoding(self, filepath: str, filename: str) -> List[Dict]:
        """Check UTF-8 encoding"""
        issues = []
        try:
            with open(filepath, 'rb') as f:
                raw = f.read()
                # Check for BOM
                if raw.startswith(b'\xef\xbb\xbf'):
                    issues.append({
                        'file': filename,
                        'standard': 'E3',
                        'line': 1,
                        'issue': 'UTF-8 BOM detected (should be removed)',
                        'severity': 'warning'
                    })
                # Check if valid UTF-8
                try:
                    raw.decode('utf-8')
                except UnicodeDecodeError:
                    issues.append({
                        'file': filename,
                        'standard': 'E3',
                        'line': 1,
                        'issue': 'Invalid UTF-8 encoding detected',
                        'severity': 'error'
                    })
        except Exception as e:
            issues.append({
                'file': filename,
                'standard': 'E3',
                'line': 1,
                'issue': f'Unable to read file: {str(e)}',
                'severity': 'error'
            })

        return issues

    def check_e7_translations(self, content: str, filename: str) -> List[Dict]:
        """Check translation completeness"""
        issues = []
        lines = content.split('\n')

        truncation_patterns = [r'\.\.\.$', r'\[truncated\]', r'\[continued\]', r'\[incomplete\]']
        incomplete_patterns = [r'\[TRANSLATION NEEDED\]', r'\[TODO\]', r'\[INCOMPLETE\]']

        for idx, line in enumerate(lines, 1):
            for pattern in truncation_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    issues.append({
                        'file': filename,
                        'standard': 'E7',
                        'line': idx,
                        'issue': f'Possible truncation: {line[:50]}...',
                        'severity': 'warning'
                    })

            for pattern in incomplete_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    issues.append({
                        'file': filename,
                        'standard': 'E7',
                        'line': idx,
                        'issue': 'Incomplete translation marker',
                        'severity': 'error'
                    })

        return issues

    def check_c1_production_notes(self, content: str, filename: str) -> List[Dict]:
        """Check for production notes"""
        issues = []
        lines = content.split('\n')

        production_patterns = [
            r'\[PRODUCTION\]', r'\[INTERNAL\]', r'\[TEST\]', r'\[DRAFT\]', r'\[BETA\]',
            r'NOTE TO DEVELOPER', r'FOR DEVELOPER', r'DEBUG:', r'FIXME:', r'HACK:', r'XXX:'
        ]

        for idx, line in enumerate(lines, 1):
            for pattern in production_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    issues.append({
                        'file': filename,
                        'standard': 'C1',
                        'line': idx,
                        'issue': f'Production note detected: {line.strip()[:50]}',
                        'severity': 'error'
                    })

        return issues

    def audit_file(self, filepath: str) -> Dict:
        """Audit single file"""
        filename = os.path.basename(filepath)

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            return {
                'file': filename,
                'path': filepath,
                'encoding': 'error',
                'issues': [{
                    'file': filename,
                    'standard': 'E3',
                    'line': 1,
                    'issue': f'Read error: {str(e)}',
                    'severity': 'error'
                }],
                'status': 'FAIL'
            }

        all_issues = [
            *self.check_e1_structure(content, filename),
            *self.check_e2_punctuation(content, filename),
            *self.check_e3_encoding(filepath, filename),
            *self.check_e7_translations(content, filename),
            *self.check_c1_production_notes(content, filename)
        ]

        has_errors = any(i['severity'] == 'error' for i in all_issues)

        return {
            'file': filename,
            'path': filepath,
            'encoding': 'UTF-8',
            'issues': all_issues,
            'status': 'FAIL' if has_errors else 'PASS'
        }

    def scan_directory(self, dirpath: str) -> List[Dict]:
        """Scan directory for all phrase scripts"""
        results = []
        for root, dirs, files in os.walk(dirpath):
            for file in sorted(files):
                if file.endswith(('.md', '.txt')):
                    filepath = os.path.join(root, file)
                    result = self.audit_file(filepath)
                    results.append(result)
        return results

    def generate_report(self, results: List[Dict]) -> Dict:
        """Generate compliance report"""
        summary = {
            'total_files': len(results),
            'passed': len([r for r in results if r['status'] == 'PASS']),
            'failed': len([r for r in results if r['status'] == 'FAIL']),
            'total_issues': sum(len(r['issues']) for r in results),
            'issues_by_standard': {},
            'issues_by_severity': {'error': 0, 'warning': 0, 'info': 0}
        }

        for result in results:
            for issue in result['issues']:
                std = issue['standard']
                summary['issues_by_standard'][std] = summary['issues_by_standard'].get(std, 0) + 1
                summary['issues_by_severity'][issue['severity']] += 1

        sorted_results = sorted(
            results,
            key=lambda r: (r['status'] != 'FAIL', r['file'])
        )

        return {
            'timestamp': datetime.now().isoformat(),
            'summary': summary,
            'files': sorted_results
        }

def main():
    auditor = FormatAuditor()
    resource_dir = 'C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\generated-resources\\50-batch'

    print(f"Scanning: {resource_dir}")
    results = auditor.scan_directory(resource_dir)

    report = auditor.generate_report(results)

    # Print summary
    print("\n" + "="*60)
    print("FORMATTING STANDARDS AUDIT REPORT")
    print("="*60)
    print(f"\nTimestamp: {report['timestamp']}")
    print(f"\nSummary:")
    print(f"  Total Files:     {report['summary']['total_files']}")
    print(f"  Passed:          {report['summary']['passed']}")
    print(f"  Failed:          {report['summary']['failed']}")
    print(f"  Total Issues:    {report['summary']['total_issues']}")
    print(f"\nIssues by Standard:")
    for std, count in sorted(report['summary']['issues_by_standard'].items()):
        print(f"  {std}: {count}")
    print(f"\nIssues by Severity:")
    for sev, count in report['summary']['issues_by_severity'].items():
        print(f"  {sev}: {count}")

    # Print files with issues
    print(f"\n{'='*60}")
    print("FILES WITH ISSUES")
    print("="*60)
    for file_result in report['files']:
        if file_result['issues']:
            print(f"\n{file_result['file']} [{file_result['status']}]")
            for issue in file_result['issues']:
                print(f"  Line {issue['line']:4d} | {issue['standard']} [{issue['severity']:7s}] {issue['issue']}")

    # Save full report
    output_file = 'C:\\Users\\brand\\Development\\Project_Workspace\\active-development\\hablas\\docs\\formatting-audit-report.json'
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
    print(f"\n\nFull report saved to: {output_file}")

if __name__ == '__main__':
    main()
