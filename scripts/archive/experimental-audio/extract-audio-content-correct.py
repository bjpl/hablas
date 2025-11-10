#!/usr/bin/env python3
"""
CORRECTED Audio Content Extraction
Extracts only the actual spoken text from audio script files,
skipping markdown headers, metadata, tone/speaker directions.
"""

import re
from typing import List, Dict

def extract_spoken_text_from_audio_script(script_content: str) -> List[Dict[str, str]]:
    """
    Extract ONLY spoken text from audio script, organized by segment.

    Returns list of segments with:
    - timestamp: Section timing
    - language: 'spanish' or 'english'
    - text: Actual text to be spoken
    - repetitions: Number of times to repeat
    - pause_after: Seconds to pause after
    """

    segments = []
    lines = script_content.split('\n')

    current_timestamp = None
    current_language = None
    in_quote = False
    collected_text = []
    repetitions = 1
    pause_after = 0

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Skip empty lines
        if not line:
            i += 1
            continue

        # Skip markdown headers (##, ###, etc.)
        if line.startswith('#'):
            i += 1
            continue

        # Skip horizontal rules
        if line.startswith('---') or line.startswith('==='):
            i += 1
            continue

        # Detect timestamp sections
        timestamp_match = re.match(r'###?\s*\[([^\]]+)\]', line)
        if timestamp_match:
            current_timestamp = timestamp_match.group(1).strip()
            i += 1
            continue

        # Skip speaker/tone metadata (but detect language)
        if line.startswith('**[Speaker:'):
            speaker_match = re.search(r'\*\*\[Speaker:\s*([^\]]+)\]\*\*', line)
            if speaker_match:
                speaker = speaker_match.group(1).lower()
                if 'spanish' in speaker or 'español' in speaker:
                    current_language = 'spanish'
                elif 'english' in speaker:
                    current_language = 'english'
            i += 1
            continue

        if line.startswith('**[Tone:') or line.startswith('**[Sound') or line.startswith('**[Pause'):
            # Extract pause duration
            if 'PAUSE' in line.upper():
                pause_match = re.search(r'(\d+)\s*seconds?', line)
                if pause_match:
                    pause_after = int(pause_match.group(1))
            i += 1
            continue

        # Extract text within quotes (actual spoken content)
        if '"' in line:
            # Extract all quoted text from this line
            quote_pattern = r'"([^"]+)"'
            quotes = re.findall(quote_pattern, line)

            for quote in quotes:
                # Clean the quote
                clean_text = quote.strip()

                # Skip if it's metadata or empty
                if not clean_text or len(clean_text) < 3:
                    continue

                # Check if this is a repeated phrase (look ahead for "repeat")
                if i + 1 < len(lines) and 'repeat' in lines[i + 1].lower():
                    repetitions = 2
                else:
                    repetitions = 1

                segments.append({
                    'timestamp': current_timestamp or 'Unknown',
                    'language': current_language or 'unknown',
                    'text': clean_text,
                    'repetitions': repetitions,
                    'pause_after': pause_after if pause_after > 0 else 2  # Default 2s pause
                })

                # Reset pause after using it
                pause_after = 0

        i += 1

    return segments


def format_for_tts(segments: List[Dict[str, str]], separate_languages: bool = False) -> Dict[str, str]:
    """
    Format extracted segments for TTS generation.

    Args:
        segments: List of segment dictionaries
        separate_languages: If True, return separate Spanish and English text

    Returns:
        Dictionary with 'spanish', 'english', or 'combined' text
    """

    spanish_parts = []
    english_parts = []

    for segment in segments:
        text = segment['text']
        language = segment['language']
        repetitions = segment['repetitions']
        pause_after = segment['pause_after']

        # Create pause markers (represented as "..." for TTS)
        pause_marker = '... ' * (pause_after // 2)  # Rough pause approximation

        # Add repetitions
        repeated_text = text
        if repetitions > 1:
            # For repeated phrases, add pause between repetitions
            repeated_text = f"{text}... ... {text}"

        # Add to appropriate language list
        if language == 'spanish':
            spanish_parts.append(repeated_text + pause_marker)
        elif language == 'english':
            english_parts.append(repeated_text + pause_marker)
        else:
            # Unknown language, try to detect
            if any(char in text for char in 'áéíóúñ¿¡'):
                spanish_parts.append(repeated_text + pause_marker)
            else:
                english_parts.append(repeated_text + pause_marker)

    if separate_languages:
        return {
            'spanish': ' '.join(spanish_parts),
            'english': ' '.join(english_parts)
        }
    else:
        # Combine in order for bilingual audio
        all_parts = []
        for segment in segments:
            text = segment['text']
            if segment['repetitions'] > 1:
                text = f"{text}... ... {text}"
            text += '... ' * (segment['pause_after'] // 2)
            all_parts.append(text)

        return {
            'combined': ' '.join(all_parts)
        }


def extract_from_lesson_markdown(markdown_content: str) -> List[Dict[str, str]]:
    """
    Extract phrases from lesson markdown files (basic_phrases_*.md).
    Returns structured phrase data.
    """

    phrases = []
    lines = markdown_content.split('\n')

    current_english = None
    current_spanish = None
    current_pronunciation = None

    for line in lines:
        line = line.strip()

        # Skip box drawing and headers
        if any(char in line for char in ['│', '┌', '└', '─', '#', '**Frase']):
            continue

        # Extract English phrase
        if 'English:' in line or '**English:**' in line:
            # Remove markdown and labels
            current_english = re.sub(r'\*\*English:\*\*|\*\*|English:|"', '', line).strip()

        # Extract Spanish translation
        elif 'Español:' in line or '**Español:**' in line:
            current_spanish = re.sub(r'\*\*Español:\*\*|\*\*|Español:|🗣️', '', line).strip()

        # Extract pronunciation guide
        elif 'Pronunciación:' in line or '🔊' in line:
            current_pronunciation = re.sub(r'Pronunciación:|🔊|\*\*|\[|\]', '', line).strip()

        # When we have a complete phrase, add it
        if current_english and current_spanish:
            phrases.append({
                'english': current_english,
                'spanish': current_spanish,
                'pronunciation': current_pronunciation or '',
                'language': 'bilingual'
            })

            # Reset for next phrase
            current_english = None
            current_spanish = None
            current_pronunciation = None

    return phrases


# Example usage
if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print("Usage: python extract-audio-content-correct.py <script_file>")
        sys.exit(1)

    script_file = sys.argv[1]

    with open(script_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine file type and extract appropriately
    if 'audio-script' in script_file:
        segments = extract_spoken_text_from_audio_script(content)

        print(f"\n📊 Extracted {len(segments)} spoken segments\n")

        for i, seg in enumerate(segments[:5], 1):  # Show first 5
            print(f"{i}. [{seg['language']}] {seg['text']}")
            print(f"   Repetitions: {seg['repetitions']}, Pause: {seg['pause_after']}s\n")

        # Generate TTS-ready text
        tts_text = format_for_tts(segments, separate_languages=True)

        print("\n🎙️ TTS-Ready Text:\n")
        print("SPANISH:")
        print(tts_text['spanish'][:200] + "...")
        print("\nENGLISH:")
        print(tts_text['english'][:200] + "...")

    else:
        phrases = extract_from_lesson_markdown(content)

        print(f"\n📊 Extracted {len(phrases)} phrases\n")

        for i, phrase in enumerate(phrases[:5], 1):
            print(f"{i}. EN: {phrase['english']}")
            print(f"   ES: {phrase['spanish']}")
            print(f"   🔊: {phrase['pronunciation']}\n")
