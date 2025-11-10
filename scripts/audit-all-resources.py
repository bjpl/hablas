#!/usr/bin/env python3
"""
Automated Audio Quality Audit Script
Audits all 56 resources for common audio generation issues
Outputs detailed JSON report with actionable fixes
"""

import os
import re
import json
import hashlib
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional

# Source file mapping (add more as needed)
SOURCE_MAPPING = {
    1: 'generated-resources/50-batch/repartidor/basic_phrases_1.md',
    4: 'generated-resources/50-batch/repartidor/basic_phrases_2.md',
    7: 'generated-resources/50-batch/conductor/basic_phrases_1.md',
    10: 'generated-resources/50-batch/conductor/basic_greetings_1.md',
    # Add more mappings for complete audit
}

class AudioAuditor:
    def __init__(self):
        self.results = {}
        self.audio_dir = Path('public/audio')
        self.scripts_dir = Path('scripts/final-phrases-only')

    def count_source_phrases(self, source_file: str) -> int:
        """Count phrases in source markdown"""
        if not os.path.exists(source_file):
            return 0

        with open(source_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Try multiple patterns
        patterns = [
            r'^## Frase',  # Spanish format
            r'\*\*English\*\*:',  # Box format
            r'- \*\*English\*\*:'  # Bullet format
        ]

        for pattern in patterns:
            count = len(re.findall(pattern, content, re.MULTILINE))
            if count > 0:
                return count

        return 0

    def count_extracted_phrases(self, resource_id: int) -> int:
        """Count phrases in extraction file"""
        script_file = self.scripts_dir / f'resource-{resource_id}-complete.txt'

        if not script_file.exists():
            return 0

        with open(script_file, 'r', encoding='utf-8') as f:
            lines = [line.strip() for line in f if line.strip()]

        # Each phrase typically has 6 lines:
        # 1. Spanish context
        # 2. English phrase
        # 3. English repeat
        # 4. Spanish translation
        # 5. Spanish tip/note
        # 6. Blank line

        # Count non-header, non-intro lines
        phrase_lines = [line for line in lines
                       if not line.upper().startswith(('SECTION', 'PHRASE', '===', '---'))]

        # Heuristic: ~6 lines per phrase
        return len(phrase_lines) // 6

    def get_audio_info(self, resource_id: int) -> Dict:
        """Get audio file metadata using ffprobe"""
        audio_file = self.audio_dir / f'resource-{resource_id}.mp3'

        if not audio_file.exists():
            return {'exists': False}

        try:
            # Get duration
            duration_cmd = [
                'ffprobe', '-i', str(audio_file),
                '-show_entries', 'format=duration',
                '-v', 'quiet',
                '-of', 'csv=p=0'
            ]
            duration = float(subprocess.check_output(duration_cmd).decode().strip())

            # Get file size
            file_size = audio_file.stat().st_size

            # Get MD5 hash
            md5_hash = hashlib.md5(audio_file.read_bytes()).hexdigest()

            return {
                'exists': True,
                'file_size': file_size,
                'file_size_mb': file_size / (1024 * 1024),
                'duration': duration,
                'duration_min': duration / 60,
                'md5': md5_hash
            }
        except Exception as e:
            return {
                'exists': True,
                'error': str(e)
            }

    def check_voice_issues(self, resource_id: int) -> List[str]:
        """Check for common voice detection issues"""
        script_file = self.scripts_dir / f'resource-{resource_id}-complete.txt'

        if not script_file.exists():
            return []

        issues = []

        with open(script_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        # Known problematic words
        english_words_with_spanish_substrings = [
            'outside', 'order', 'customer', 'inside'
        ]

        spanish_delivery_words = [
            'solo', 'recojo', 'entrego', 'dejaré', 'edificio'
        ]

        for line_num, line in enumerate(lines, 1):
            line_lower = line.lower()

            # Check for English words that might be detected as Spanish
            for word in english_words_with_spanish_substrings:
                if word in line_lower:
                    # This might be incorrectly using Spanish voice
                    issues.append(
                        f"Line {line_num}: '{word}' might use Spanish voice "
                        f"(contains Spanish substring)"
                    )

            # Check for Spanish delivery words (need explicit detection)
            for word in spanish_delivery_words:
                if word in line_lower:
                    issues.append(
                        f"Line {line_num}: '{word}' needs Spanish voice "
                        f"(delivery-specific Spanish)"
                    )

        return issues

    def check_metadata_leakage(self, resource_id: int) -> List[str]:
        """Check if script contains metadata that shouldn't be narrated"""
        script_file = self.scripts_dir / f'resource-{resource_id}-complete.txt'

        if not script_file.exists():
            return []

        issues = []
        metadata_patterns = [
            r'\[Tone:',
            r'\[Speaker:',
            r'\[PAUSE:',
            r'\[Sound',
            r'\[Background',
            r'INTRODUCTION',
            r'PHRASE \d+:',
            r'SECTION \d+',
            r'^\*\*[A-Z]'  # Bold headers
        ]

        with open(script_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        for line_num, line in enumerate(lines, 1):
            for pattern in metadata_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    issues.append(
                        f"Line {line_num}: Contains metadata '{pattern}' "
                        f"that shouldn't be narrated"
                    )

        return issues

    def audit_resource(self, resource_id: int) -> Dict:
        """Perform complete audit of a single resource"""
        print(f"  Auditing Resource {resource_id}...")

        result = {
            'resource_id': resource_id,
            'timestamp': datetime.now().isoformat(),
            'issues': [],
            'warnings': [],
            'status': 'UNKNOWN'
        }

        # 1. Check if source mapping exists
        source_file = SOURCE_MAPPING.get(resource_id)
        if source_file:
            source_phrases = self.count_source_phrases(source_file)
            result['source_file'] = source_file
            result['source_phrases'] = source_phrases
        else:
            result['warnings'].append('No source file mapping')
            source_phrases = 0

        # 2. Check extracted phrases
        extracted_phrases = self.count_extracted_phrases(resource_id)
        result['extracted_phrases'] = extracted_phrases

        # 3. Check phrase coverage
        if source_phrases > 0 and extracted_phrases > 0:
            coverage = (extracted_phrases / source_phrases) * 100
            result['phrase_coverage'] = f"{extracted_phrases}/{source_phrases} ({coverage:.1f}%)"

            if coverage < 100:
                result['issues'].append(
                    f"Incomplete coverage: {coverage:.1f}% "
                    f"({source_phrases - extracted_phrases} phrases missing)"
                )

        # 4. Check audio file
        audio_info = self.get_audio_info(resource_id)
        result['audio'] = audio_info

        if not audio_info.get('exists'):
            result['issues'].append("Audio file does not exist")
            result['status'] = 'MISSING_AUDIO'
            return result

        # 5. Check file size expectations
        if audio_info.get('file_size_mb'):
            expected_min_size = extracted_phrases * 0.15  # ~0.15 MB per phrase
            expected_max_size = extracted_phrases * 0.4   # ~0.4 MB per phrase

            actual_size = audio_info['file_size_mb']

            if actual_size < expected_min_size:
                result['issues'].append(
                    f"File size too small: {actual_size:.1f} MB "
                    f"(expected {expected_min_size:.1f}-{expected_max_size:.1f} MB)"
                )
            elif actual_size > expected_max_size * 2:
                result['warnings'].append(
                    f"File size larger than expected: {actual_size:.1f} MB "
                    f"(expected {expected_min_size:.1f}-{expected_max_size:.1f} MB)"
                )

        # 6. Check duration expectations
        if audio_info.get('duration_min'):
            expected_min_duration = extracted_phrases * 0.3  # ~0.3 min per phrase
            expected_max_duration = extracted_phrases * 0.5  # ~0.5 min per phrase

            actual_duration = audio_info['duration_min']

            if actual_duration < expected_min_duration:
                result['issues'].append(
                    f"Duration too short: {actual_duration:.1f} min "
                    f"(expected {expected_min_duration:.1f}-{expected_max_duration:.1f} min)"
                )

        # 7. Check voice detection issues
        voice_issues = self.check_voice_issues(resource_id)
        if voice_issues:
            result['voice_issues'] = voice_issues[:5]  # Limit to first 5
            if len(voice_issues) > 0:
                result['warnings'].append(
                    f"Found {len(voice_issues)} potential voice detection issues"
                )

        # 8. Check metadata leakage
        metadata_issues = self.check_metadata_leakage(resource_id)
        if metadata_issues:
            result['metadata_issues'] = metadata_issues[:5]
            if len(metadata_issues) > 0:
                result['issues'].append(
                    f"Found {len(metadata_issues)} metadata leakage issues"
                )

        # 9. Determine status
        if len(result['issues']) == 0:
            result['status'] = 'PASS' if len(result['warnings']) == 0 else 'PASS_WITH_WARNINGS'
        else:
            result['status'] = 'NEEDS_FIX'

        return result

    def find_duplicates(self) -> Dict[str, List[int]]:
        """Find duplicate audio files by MD5 hash"""
        hash_map = {}

        for resource_id in range(1, 57):
            audio_info = self.get_audio_info(resource_id)
            if audio_info.get('md5'):
                md5 = audio_info['md5']
                if md5 not in hash_map:
                    hash_map[md5] = []
                hash_map[md5].append(resource_id)

        # Return only duplicates
        return {md5: ids for md5, ids in hash_map.items() if len(ids) > 1}

    def run_full_audit(self, resource_ids: Optional[List[int]] = None) -> Dict:
        """Run audit on all or specified resources"""
        if resource_ids is None:
            resource_ids = range(1, 57)

        print("=" * 70)
        print("AUTOMATED AUDIO QUALITY AUDIT")
        print("=" * 70)
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

        # Audit each resource
        for resource_id in resource_ids:
            result = self.audit_resource(resource_id)
            self.results[resource_id] = result

        # Check for duplicates
        print("\n  Checking for duplicate audio files...")
        duplicates = self.find_duplicates()

        # Summary statistics
        summary = {
            'total_resources': len(resource_ids),
            'pass': sum(1 for r in self.results.values() if r['status'] == 'PASS'),
            'pass_with_warnings': sum(1 for r in self.results.values()
                                     if r['status'] == 'PASS_WITH_WARNINGS'),
            'needs_fix': sum(1 for r in self.results.values()
                            if r['status'] == 'NEEDS_FIX'),
            'missing_audio': sum(1 for r in self.results.values()
                                if r['status'] == 'MISSING_AUDIO'),
            'duplicate_groups': len(duplicates)
        }

        # Print summary
        print("\n" + "=" * 70)
        print("AUDIT SUMMARY")
        print("=" * 70)
        print(f"Total Resources: {summary['total_resources']}")
        print(f"✅ Pass: {summary['pass']}")
        print(f"⚠️  Pass with Warnings: {summary['pass_with_warnings']}")
        print(f"❌ Needs Fix: {summary['needs_fix']}")
        print(f"🔴 Missing Audio: {summary['missing_audio']}")
        print(f"🔄 Duplicate Groups: {summary['duplicate_groups']}")

        if duplicates:
            print("\nDuplicate Audio Files:")
            for md5, ids in duplicates.items():
                print(f"  {md5[:8]}...: Resources {', '.join(map(str, ids))}")

        # Create full report
        report = {
            'timestamp': datetime.now().isoformat(),
            'summary': summary,
            'duplicates': duplicates,
            'results': self.results
        }

        # Save to file
        output_file = 'audit-results.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        print(f"\n📊 Full report saved to: {output_file}")

        return report

def main():
    auditor = AudioAuditor()

    # Run audit on all resources (or specify subset)
    # For quick test: resource_ids = [1, 4, 7, 10]
    report = auditor.run_full_audit()

    # Print resources needing fixes
    needs_fix = [rid for rid, result in auditor.results.items()
                 if result['status'] == 'NEEDS_FIX']

    if needs_fix:
        print("\n" + "=" * 70)
        print("RESOURCES NEEDING FIXES")
        print("=" * 70)
        for rid in needs_fix:
            result = auditor.results[rid]
            print(f"\nResource {rid}:")
            for issue in result.get('issues', []):
                print(f"  ❌ {issue}")

        print(f"\n⚠️  Total resources needing fixes: {len(needs_fix)}")
    else:
        print("\n✅ All resources passed audit!")

    return 0 if len(needs_fix) == 0 else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
