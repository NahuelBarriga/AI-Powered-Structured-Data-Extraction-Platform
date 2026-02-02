import type { ParsedAIResponse } from "./response.types";

export function parseAIResponse(rawResponse: string): ParsedAIResponse {
  try {
    // Trim to remove leading/trailing whitespace
    const trimmed = rawResponse.trim();

    // Attempt direct JSON parsing
    const parsed = JSON.parse(trimmed);

    return {
      success: true,
      data: parsed
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to parse AI response as valid JSON"
    };
  }
}
