/**
 * Utilities for parsing bilingual content
 */

import { BilingualPhrase } from './types';

/**
 * Parse bilingual markdown content into English and Spanish phrase pairs
 */
export function parseBilingualContent(content: string): {
  englishPhrases: BilingualPhrase[];
  spanishPhrases: BilingualPhrase[];
} {
  const lines = content.split('\n');
  const englishPhrases: BilingualPhrase[] = [];
  const spanishPhrases: BilingualPhrase[] = [];

  let currentEnglish: string | null = null;
  let currentSpanish: string | null = null;
  let lineNumber = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    lineNumber = i + 1;

    // Match **English**: pattern
    const englishMatch = line.match(/^\*\*English\*\*:\s*(.+)$/i);
    if (englishMatch) {
      currentEnglish = englishMatch[1].trim();
      continue;
    }

    // Match **Spanish**: or **Español**: pattern
    const spanishMatch = line.match(/^\*\*(Spanish|Español)\*\*:\s*(.+)$/i);
    if (spanishMatch) {
      currentSpanish = spanishMatch[2].trim();

      // If we have both English and Spanish, add as a pair
      if (currentEnglish) {
        englishPhrases.push({
          english: currentEnglish,
          spanish: currentSpanish,
          lineNumber: lineNumber - 1,
        });
        spanishPhrases.push({
          english: currentEnglish,
          spanish: currentSpanish,
          lineNumber,
        });
        currentEnglish = null;
        currentSpanish = null;
      }
      continue;
    }

    // Alternative pattern: Look for lines with / separator
    const slashPattern = line.match(/^(.+?)\s*\/\s*(.+)$/);
    if (slashPattern && !line.startsWith('#')) {
      const [, eng, esp] = slashPattern;
      englishPhrases.push({
        english: eng.trim(),
        spanish: esp.trim(),
        lineNumber,
      });
      spanishPhrases.push({
        english: eng.trim(),
        spanish: esp.trim(),
        lineNumber,
      });
    }
  }

  return { englishPhrases, spanishPhrases };
}

/**
 * Reconstruct bilingual markdown from phrase pairs
 */
export function reconstructBilingualContent(
  phrases: BilingualPhrase[]
): string {
  return phrases
    .map(phrase => {
      return `**English**: ${phrase.english}\n**Spanish**: ${phrase.spanish}`;
    })
    .join('\n\n');
}

/**
 * Check for missing translations
 */
export function findMissingTranslations(
  englishPhrases: BilingualPhrase[],
  spanishPhrases: BilingualPhrase[]
): { missingEnglish: number[]; missingSpanish: number[] } {
  const missingEnglish: number[] = [];
  const missingSpanish: number[] = [];

  englishPhrases.forEach((phrase, idx) => {
    if (!spanishPhrases[idx] || !spanishPhrases[idx].spanish) {
      missingSpanish.push(idx);
    }
  });

  spanishPhrases.forEach((phrase, idx) => {
    if (!englishPhrases[idx] || !englishPhrases[idx].english) {
      missingEnglish.push(idx);
    }
  });

  return { missingEnglish, missingSpanish };
}
