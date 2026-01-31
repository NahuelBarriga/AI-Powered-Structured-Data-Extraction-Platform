export function sanitizeJson(text: string): string {
  return text
    .replace(/```json\s*/i, "")
    .replace(/```/g, "")
    .trim();
}