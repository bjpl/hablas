/**
 * Clean box-drawing characters from content while preserving text
 */
export function cleanBoxContent(markdown: string): string {
  // Remove box-drawing characters but keep the content
  const boxChars = /[─│┌┐└┘├┤┬┴┼╔╗╚╝╠╣╦╩╬═║]/g;

  // Replace box characters with nothing
  let cleaned = markdown.replace(boxChars, '');

  // Clean up excessive whitespace but preserve intentional line breaks
  cleaned = cleaned
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines

  return cleaned;
}

/**
 * Transform box-content pre blocks into elegant cards
 */
export function transformPhraseBoxes(html: string): string {
  // Find pre blocks that contain phrase content
  const preRegex = /<pre>([\s\S]*?)<\/pre>/g;

  return html.replace(preRegex, (match, content) => {
    // Check if this pre block contains phrase information
    const hasPhrase = content.includes('English:') ||
                     content.includes('Español:') ||
                     content.includes('Pronunciación:');

    if (!hasPhrase) {
      return match; // Keep non-phrase pre blocks as is
    }

    // Clean box-drawing characters
    const cleaned = cleanBoxContent(content);

    // Transform into elegant card
    return `<div class="phrase-card">${cleaned}</div>`;
  });
}
