/**
 * Clean audio script production metadata and format for display
 * Removes internal production notes and formats content professionally
 */
export function cleanAudioScript(content: string): string {
  let cleaned = content;

  // Remove all production metadata and instructions (comprehensive patterns)
  cleaned = cleaned.replace(/\*\*\[Tone:.*?\]\*\*/gi, '');
  cleaned = cleaned.replace(/\*\*\[Speaker:.*?\]\*\*/gi, '');
  cleaned = cleaned.replace(/\*\*\[PAUSE:.*?\]\*\*/gi, '');
  cleaned = cleaned.replace(/\[Pause:.*?\]/gi, '');
  cleaned = cleaned.replace(/\[Sound effect:.*?\]/gi, '');
  cleaned = cleaned.replace(/\[Speaker:.*?\]/gi, '');
  cleaned = cleaned.replace(/\[Tone:.*?\]/gi, '');

  // Remove ALL timestamp patterns in headers
  cleaned = cleaned.replace(/###\s*\[[\d:]+\]\s*/g, '### ');
  cleaned = cleaned.replace(/##\s*\[[\d:]+\s*-\s*[\d:]+\]\s*/g, '## ');
  cleaned = cleaned.replace(/\[[\d]{2}:[\d]{2}\]/g, ''); // [00:50] standalone

  // Remove production metadata from headers (all patterns)
  cleaned = cleaned.replace(/\*\*Total Duration\*\*:.*?\n/gi, '');
  cleaned = cleaned.replace(/\*\*Target\*\*:.*?\n/gi, '');
  cleaned = cleaned.replace(/\*\*Language\*\*:.*?\n/gi, '');
  cleaned = cleaned.replace(/Duration:.*?\n/gi, '');
  cleaned = cleaned.replace(/Target:.*?\n/gi, '');
  cleaned = cleaned.replace(/Language:.*?\n/gi, '');

  // Remove narrator/voice metadata
  cleaned = cleaned.replace(/\*\*Spanish Narrator\*\*:.*?\n/gi, '');
  cleaned = cleaned.replace(/\*\*English Speaker\*\*:.*?\n/gi, '');
  cleaned = cleaned.replace(/Spanish narrator.*?\n/gi, '');
  cleaned = cleaned.replace(/English native.*?\n/gi, '');

  // Convert quoted speech to blockquotes for better formatting
  // Match quoted phrases like "Hi, I have your delivery"
  cleaned = cleaned.replace(/"([^"]+)"/g, (match, quote) => {
    // Don't convert if it's part of a heading or if it's a short word
    if (quote.length < 5) return match;
    return `\n> ${quote}\n`;
  });

  // Clean up section dividers - reduce visual clutter
  cleaned = cleaned.replace(/---+\n*/g, '\n\n');

  // Remove excessive blank lines (max 2 consecutive newlines)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Clean up whitespace around blockquotes
  cleaned = cleaned.replace(/\n+>/g, '\n\n>');
  cleaned = cleaned.replace(/>\s+\n+/g, '>\n\n');

  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Check if content is an audio script based on markers
 */
export function isAudioScript(content: string): boolean {
  const audioMarkers = [
    'AUDIO SCRIPT',
    '[Tone:',
    '[Speaker:',
    '[PAUSE:',
    'Total Duration',
    '**[Speaker:',
    'sound effect'
  ];

  return audioMarkers.some(marker =>
    content.toLowerCase().includes(marker.toLowerCase())
  );
}

/**
 * Extract clean title from audio script
 */
export function extractAudioScriptTitle(content: string): string | null {
  // Try to find title in markdown heading
  const titleMatch = content.match(/^#\s+(?:AUDIO SCRIPT:\s+)?(.+)/m);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  return null;
}
