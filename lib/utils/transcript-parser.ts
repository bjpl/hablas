/**
 * Transcript Parser Utility
 *
 * Parses audio script content into structured transcript segments
 * for use with AudioTranscriptReview component.
 *
 * Expected format in audio scripts:
 * - Time markers: [00:00], [00:50 - 05:45], etc.
 * - Speaker tags: **[Speaker: English native]**, **[Speaker: Spanish narrator]**
 * - Content in quotes or plain text
 */

export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  english: string;
  spanish: string;
  speaker?: 'narrator' | 'example' | 'student';
  pronunciation?: string;
}

/**
 * Parse time string to seconds
 * Handles formats: "00:00", "1:35", "05:45"
 */
function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
  }
  return 0;
}

/**
 * Determine speaker type from speaker string
 */
function parseSpeakerType(speakerStr: string): 'narrator' | 'example' | 'student' {
  const lower = speakerStr.toLowerCase();
  if (lower.includes('english') || lower.includes('native')) {
    return 'example';
  }
  if (lower.includes('student') || lower.includes('learner')) {
    return 'student';
  }
  return 'narrator';
}

/**
 * Parse audio script content into transcript segments
 */
export function parseAudioScript(content: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const lines = content.split('\n');

  let currentTime = 0;
  let currentSpeaker: 'narrator' | 'example' | 'student' = 'narrator';
  let currentEnglish = '';
  let currentSpanish = '';
  let segmentId = 0;

  // Regex patterns
  const timeRangePattern = /\[(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\]/;
  const singleTimePattern = /\[(\d{1,2}:\d{2})\]/;
  const speakerPattern = /\*\*\[Speaker:\s*([^\]]+)\]\*\*/i;
  const quotedTextPattern = /"([^"]+)"/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for time range marker
    const timeRangeMatch = line.match(timeRangePattern);
    if (timeRangeMatch) {
      // Save previous segment if we have content
      if (currentEnglish || currentSpanish) {
        segments.push({
          id: `segment-${segmentId++}`,
          startTime: currentTime,
          endTime: parseTimeToSeconds(timeRangeMatch[1]),
          english: currentEnglish.trim(),
          spanish: currentSpanish.trim(),
          speaker: currentSpeaker,
        });
        currentEnglish = '';
        currentSpanish = '';
      }
      currentTime = parseTimeToSeconds(timeRangeMatch[1]);
      continue;
    }

    // Check for single time marker
    const singleTimeMatch = line.match(singleTimePattern);
    if (singleTimeMatch) {
      // Save previous segment if we have content
      if (currentEnglish || currentSpanish) {
        segments.push({
          id: `segment-${segmentId++}`,
          startTime: currentTime,
          endTime: parseTimeToSeconds(singleTimeMatch[1]),
          english: currentEnglish.trim(),
          spanish: currentSpanish.trim(),
          speaker: currentSpeaker,
        });
        currentEnglish = '';
        currentSpanish = '';
      }
      currentTime = parseTimeToSeconds(singleTimeMatch[1]);
      continue;
    }

    // Check for speaker change
    const speakerMatch = line.match(speakerPattern);
    if (speakerMatch) {
      currentSpeaker = parseSpeakerType(speakerMatch[1]);
      continue;
    }

    // Extract quoted text (spoken content)
    const quotedMatches = Array.from(line.matchAll(quotedTextPattern));
    for (const match of quotedMatches) {
      const text = match[1].trim();
      if (text) {
        // Determine if English or Spanish based on context and speaker
        if (currentSpeaker === 'example') {
          // English native speaker - this is English
          if (!currentEnglish) {
            currentEnglish = text;
          }
        } else if (currentSpeaker === 'narrator') {
          // Narrator speaks both - check content
          if (line.toLowerCase().includes('español') || line.toLowerCase().includes('spanish')) {
            currentSpanish = text;
          } else if (isEnglishPhrase(text)) {
            currentEnglish = text;
          } else {
            // Assume Spanish for narrator
            currentSpanish += (currentSpanish ? ' ' : '') + text;
          }
        }
      }
    }

    // Also capture non-quoted content that looks like phrases
    if (!line.startsWith('**') && !line.startsWith('#') && !line.startsWith('---')) {
      const cleanLine = line
        .replace(/\*\*[^*]+\*\*/g, '') // Remove bold markers
        .replace(/\[.*?\]/g, '') // Remove brackets
        .trim();

      if (cleanLine && cleanLine.length > 5 && !cleanLine.startsWith('En español')) {
        // Check for "En español:" pattern which indicates Spanish translation
        if (line.includes('En español:')) {
          const spanishPart = line.split('En español:')[1]?.trim();
          if (spanishPart) {
            currentSpanish = spanishPart.replace(/"/g, '');
          }
        }
      }
    }
  }

  // Push final segment
  if (currentEnglish || currentSpanish) {
    segments.push({
      id: `segment-${segmentId}`,
      startTime: currentTime,
      endTime: currentTime + 30, // Default 30 second ending
      english: currentEnglish.trim(),
      spanish: currentSpanish.trim(),
      speaker: currentSpeaker,
    });
  }

  // Filter out empty segments and set proper end times
  return segments
    .filter(seg => seg.english || seg.spanish)
    .map((seg, idx, arr) => ({
      ...seg,
      endTime: arr[idx + 1]?.startTime || seg.endTime,
    }));
}

/**
 * Check if text looks like an English phrase
 */
function isEnglishPhrase(text: string): boolean {
  const englishWords = ['the', 'is', 'are', 'have', 'your', 'here', 'thank', 'please', 'hi', 'hello', 'delivery', 'order'];
  const lower = text.toLowerCase();
  return englishWords.some(word => lower.includes(word));
}

/**
 * Check if content is an audio script with timestamps
 */
export function isAudioScript(content: string): boolean {
  // Look for time markers that indicate this is an audio script
  const timePatterns = [
    /\[\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\]/, // [00:00 - 05:45]
    /##\s*\[\d{1,2}:\d{2}\]/, // ## [00:50]
    /###\s*\[\d{1,2}:\d{2}\]/, // ### [01:35]
    /\*\*Total Duration\*\*:/, // Audio script header
  ];

  return timePatterns.some(pattern => pattern.test(content));
}

/**
 * Generate VTT subtitle format from segments
 */
export function generateVTT(segments: TranscriptSegment[], includeSpanish: boolean = true): string {
  let vtt = 'WEBVTT\n\n';

  segments.forEach((seg, idx) => {
    const startTime = formatVTTTime(seg.startTime);
    const endTime = formatVTTTime(seg.endTime);

    vtt += `${idx + 1}\n`;
    vtt += `${startTime} --> ${endTime}\n`;
    vtt += seg.english;
    if (includeSpanish && seg.spanish) {
      vtt += `\n${seg.spanish}`;
    }
    vtt += '\n\n';
  });

  return vtt;
}

/**
 * Format seconds to VTT timestamp (00:00:00.000)
 */
function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}
