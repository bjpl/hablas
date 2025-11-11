/**
 * Transform audio production scripts into clean, user-friendly phrase lists
 *
 * This removes all production metadata (speaker notes, timing, technical specs)
 * and extracts only the learnable phrases in a beautiful, simple format.
 */

interface AudioPhrase {
  number: number;
  title: string;
  english: string;
  spanish: string;
  tip?: string;
}

/**
 * Extract phrases from audio script production file
 */
function extractPhrasesFromScript(content: string): AudioPhrase[] {
  const phrases: AudioPhrase[] = [];

  // Split into sections by ### headers (FRASE 1, FRASE 2, etc.)
  const sections = content.split(/###\s+\[[\d:]+\]\s+FRASE\s+(\d+):/);

  for (let i = 1; i < sections.length; i += 2) {
    const number = parseInt(sections[i]);
    const sectionContent = sections[i + 1];

    // Extract title from first line
    const titleMatch = sectionContent.match(/^([^\n]+)/);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract English phrase (appears in quotes after "English native" speaker directive)
    // Look for quotes that come AFTER the "English native" marker
    const afterEnglishNative = sectionContent.split(/\*\*\[Speaker:\s*English native/)[1] || '';
    const englishMatches = afterEnglishNative.match(/"([^"]+)"/);
    const english = englishMatches && englishMatches.length > 1
      ? englishMatches[1]
      : '';

    // Extract Spanish translation
    // Format 1: Appears after "En español:" (Phrase 1)
    // Format 2: Appears in quotes after Spanish narrator speaks the second time
    let spanish = '';
    const esMatch = sectionContent.match(/En español:\s*([^\n]+)/);
    if (esMatch) {
      spanish = esMatch[1].replace(/\.$/, '').trim();
    } else {
      // Look for ANY quoted text after the second Spanish narrator marker
      const parts = sectionContent.split(/\*\*\[Speaker:\s*Spanish narrator\]\*\*/);
      if (parts.length >= 3) {
        const afterSecondNarrator = parts[2];
        // Extract first quoted text (until first newline)
        const spanishQuoteMatch = afterSecondNarrator.match(/"([^\n]+?)\n/);
        if (spanishQuoteMatch) {
          spanish = spanishQuoteMatch[1].trim();
        }
      }
    }

    // Extract tip (appears after Spanish translation, before next section)
    const tipMatch = sectionContent.match(/En español:[^.]+\.\s*\n\s*([^"\n]+)/);
    const tip = tipMatch ? tipMatch[1].trim() : undefined;

    if (english && spanish) {
      phrases.push({
        number,
        title,
        english,
        spanish,
        tip
      });
    }
  }

  return phrases;
}

/**
 * Transform audio script to clean user format
 */
export function transformAudioScriptToUserFormat(content: string): string {
  const phrases = extractPhrasesFromScript(content);

  if (phrases.length === 0) {
    // Fallback: return cleaned version without production notes
    return cleanProductionMetadata(content);
  }

  let output = '# Frases Esenciales para Practicar\n\n';
  output += '*Escucha el audio y repite cada frase. La pronunciación correcta es clave para tu éxito.*\n\n';
  output += '---\n\n';

  phrases.forEach((phrase, index) => {
    output += `## ${phrase.number}. ${phrase.title}\n\n`;

    output += `**English**\n`;
    output += `> ${phrase.english}\n\n`;

    output += `**Español**\n`;
    output += `> ${phrase.spanish}\n\n`;

    if (phrase.tip) {
      output += `**Consejo**\n`;
      output += `${phrase.tip}\n\n`;
    }

    if (index < phrases.length - 1) {
      output += '---\n\n';
    }
  });

  // Add helpful footer
  output += '\n---\n\n';
  output += '## Cómo Practicar\n\n';
  output += '1. **Escucha** el audio completo primero\n';
  output += '2. **Repite** cada frase en voz alta\n';
  output += '3. **Practica** 2 veces al día durante una semana\n';
  output += '4. **Usa** las frases HOY con tus clientes\n\n';
  output += '*Cada frase que aprendes es dinero en tu bolsillo.*\n';

  return output;
}

/**
 * Fallback: Clean production metadata for scripts without clear phrase structure
 */
function cleanProductionMetadata(content: string): string {
  let cleaned = content;

  // Remove production notes sections
  cleaned = cleaned.replace(/##\s+📋\s+PRODUCTION NOTES[\s\S]*?(?=\n##|\n---|\z)/g, '');
  cleaned = cleaned.replace(/##\s+🎯\s+LEARNING OUTCOMES[\s\S]*?(?=\n##|\n---|\z)/g, '');

  // Remove all speaker/director instructions in brackets
  cleaned = cleaned.replace(/\*\*\[(?:Tone|Speaker|Sound effect|PAUSE|Pause|END):[^\]]+\]\*\*/g, '');

  // Remove timestamp headers but keep the content
  cleaned = cleaned.replace(/###\s+\[[\d:]+\]\s+/g, '### ');
  cleaned = cleaned.replace(/##\s+\[[\d:]+\s+-\s+[\d:]+\]\s+/g, '## ');

  // Remove voice casting and technical specs
  cleaned = cleaned.replace(/###\s+Voice Casting:[\s\S]*?(?=\n###|\n##|\z)/g, '');
  cleaned = cleaned.replace(/###\s+Audio Quality:[\s\S]*?(?=\n###|\n##|\z)/g, '');
  cleaned = cleaned.replace(/###\s+Timing Precision:[\s\S]*?(?=\n###|\n##|\z)/g, '');
  cleaned = cleaned.replace(/###\s+Mobile Optimization:[\s\S]*?(?=\n###|\n##|\z)/g, '');

  // Remove metadata at the top
  cleaned = cleaned.replace(/\*\*Total Duration\*\*:.*\n/g, '');
  cleaned = cleaned.replace(/\*\*Target\*\*:.*\n/g, '');
  cleaned = cleaned.replace(/\*\*Language\*\*:.*\n/g, '');

  // Clean up excessive whitespace
  cleaned = cleaned
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');

  return cleaned;
}

/**
 * Detect if content is an audio production script
 */
export function isAudioProductionScript(content: string): boolean {
  return content.includes('[Speaker:') ||
         content.includes('[Tone:') ||
         content.includes('PRODUCTION NOTES') ||
         content.includes('**[Speaker:');
}
