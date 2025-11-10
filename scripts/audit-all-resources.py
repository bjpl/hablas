#!/usr/bin/env python3
"""
Automated Audio Quality Audit Script
Audits all 56 resources for common audio generation issues
Outputs detailed JSON report with actionable fixes
Enhanced to check MULTIPLE source types: markdown, audio scripts, JSON specs
"""

import os
import re
import json
import hashlib
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional
from glob import glob

class AudioAuditor:
    def __init__(self):
        self.results = {}
        self.audio_dir = Path('public/audio')
        self.scripts_dir = Path('scripts/final-phrases-only')
        self.batch_dir = Path('generated-resources/50-batch')
        self.specs_dir = Path('audio-specs')

    def find_source_for_resource(self, resource_id: int) -> Dict:
        """
        Find ALL possible sources for a resource
        Priority order:
        1. Audio spec JSON (most authoritative)
        2. Audio script TXT (structured format)
        3. Markdown files (original content)
        4. Phrase extraction files (fallback)
        """
        sources = {
            'found': False,
            'types': [],
            'phrase_count': 0,
            'files': []
        }

        # 1. Check for audio spec JSON
        spec_file = self.specs_dir / f'resource-{resource_id}-spec.json'
        if spec_file.exists():
            try:
                with open(spec_file, 'r', encoding='utf-8') as f:
                    spec_data = json.load(f)

                # Get totalSegments from content
                total_segments = spec_data.get('content', {}).get('totalSegments', 0)

                # Segments typically include intro/outro, so phrases are segments - 2
                # Or we can count segments with "FRASE" in notes
                phrase_count = 0
                for segment in spec_data.get('content', {}).get('segments', []):
                    notes = segment.get('notes', '')
                    if 'FRASE' in notes.upper():
                        phrase_count += 1

                sources['found'] = True
                sources['types'].append('audio_spec')
                sources['phrase_count'] = phrase_count if phrase_count > 0 else max(0, total_segments - 2)
                sources['files'].append(str(spec_file))
            except Exception as e:
                pass

        # 2. Check for audio script TXT
        audio_script_files = list(self.batch_dir.glob('**/*-audio-script.txt'))
        for script_file in audio_script_files:
            # Try to match resource ID in filename or content
            try:
                with open(script_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Check if this script is for our resource
                # Look for resource ID in metadata or filename pattern
                if self.is_script_for_resource(script_file, resource_id, content):
                    phrase_count = self.count_phrases_in_audio_script(content)

                    if phrase_count > 0:
                        sources['found'] = True
                        sources['types'].append('audio_script')
                        if phrase_count > sources['phrase_count']:
                            sources['phrase_count'] = phrase_count
                        sources['files'].append(str(script_file))
                        break  # Use first matching script
            except Exception as e:
                pass

        # 3. Check for markdown files
        md_files = list(self.batch_dir.glob('**/*.md'))
        for md_file in md_files:
            if '-image-spec' in md_file.name:
                continue  # Skip image specs

            try:
                phrase_count = self.count_source_phrases(str(md_file))
                if phrase_count > 0:
                    # Check if this might be for our resource
                    # This is heuristic-based
                    sources['found'] = True
                    if 'markdown' not in sources['types']:
                        sources['types'].append('markdown')
                    if phrase_count > sources['phrase_count']:
                        sources['phrase_count'] = phrase_count
                    if str(md_file) not in sources['files']:
                        sources['files'].append(str(md_file))
            except Exception as e:
                pass

        return sources

    def is_script_for_resource(self, script_file: Path, resource_id: int, content: str) -> bool:
        """Check if audio script matches resource ID"""
        # Common patterns to match scripts to resources
        # This is heuristic-based - you may need to adjust

        # Pattern 1: Resource ID in filename or path
        if f'resource-{resource_id}' in str(script_file).lower():
            return True

        # Pattern 2: Check for resource mapping in content
        if f'"resourceId": {resource_id}' in content:
            return True

        # Pattern 3: Mapping based on known patterns
        # basic_audio_1 -> resource 2
        # basic_audio_2 -> resource 4
        filename = script_file.stem
        mappings = {
            'basic_audio_1-audio-script': 2,
            'basic_audio_2-audio-script': 4,
            'basic_audio_navigation_1-audio-script': 7,
            'basic_audio_navigation_2-audio-script': 10,
            # Add more mappings as needed
        }

        if filename in mappings and mappings[filename] == resource_id:
            return True

        return False

    def count_phrases_in_audio_script(self, content: str) -> int:
        """Count phrases in audio script TXT format"""
        # Count "FRASE" markers
        frase_count = len(re.findall(r'FRASE \d+:', content, re.IGNORECASE))
        if frase_count > 0:
            return frase_count

        # Fallback: count "Frase número" in Spanish
        frase_numero = len(re.findall(r'Frase número \w+:', content, re.IGNORECASE))
        if frase_numero > 0:
            return frase_numero

        # Fallback: count English/Spanish phrase pairs
        english_phrases = len(re.findall(r'\*\*\[Speaker: English native', content))
        if english_phrases > 0:
            return english_phrases // 2  # Each phrase said twice

        return 0

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

        # 1. Find ALL sources for this resource
        sources = self.find_source_for_resource(resource_id)

        if sources['found']:
            result['source_types'] = sources['types']
            result['source_files'] = sources['files']
            result['source_phrases'] = sources['phrase_count']
            source_phrases = sources['phrase_count']
        else:
            result['warnings'].append('No source files found (checked markdown, audio scripts, JSON specs)')
            source_phrases = 0

        # 2. Check extracted phrases
        extracted_phrases = self.count_extracted_phrases(resource_id)
        result['extracted_phrases'] = extracted_phrases

        # 3. Check phrase coverage
        if source_phrases > 0 and extracted_phrases > 0:
            coverage = (extracted_phrases / source_phrases) * 100
            result['phrase_coverage'] = f"{extracted_phrases}/{source_phrases} ({coverage:.1f}%)"

            if coverage < 90:  # More lenient threshold
                result['issues'].append(
                    f"Low coverage: {coverage:.1f}% "
                    f"(~{source_phrases - extracted_phrases} phrases may be missing)"
                )
            elif coverage < 100:
                result['warnings'].append(
                    f"Partial coverage: {coverage:.1f}% "
                    f"(~{source_phrases - extracted_phrases} phrases may be missing)"
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
