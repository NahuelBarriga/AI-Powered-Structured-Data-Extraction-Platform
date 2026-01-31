export function extractJson(text: string): string {
  return text
    .replace(/```json\s*/i, "")
    .replace(/```/g, "")
    .trim();
}