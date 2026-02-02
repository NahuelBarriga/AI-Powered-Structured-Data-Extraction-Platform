/**
 * Removes markdown JSON code block syntax from text.
 * Strips "```json" opening and "```" closing markers, then trims whitespace.
 * Useful for cleaning LLM responses that wrap JSON in markdown code blocks.
 * 
 * @param text - Input text potentially containing markdown-wrapped JSON
 * @returns Cleaned text with markdown markers removed
 */
export function sanitizeJson(text: string): string {
  return text
    .replace(/```json\s*/i, "")
    .replace(/```/g, "")
    .trim();
}