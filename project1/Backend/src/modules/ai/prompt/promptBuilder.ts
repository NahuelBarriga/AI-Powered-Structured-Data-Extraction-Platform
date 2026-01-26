import type { PromptBuildInput, BuiltPrompt } from "./prompt.types";
import { PROMPT_VERSION, buildSystemPrompt } from "./promptVersions";

export function buildExtractionPrompt(
  input: PromptBuildInput
): BuiltPrompt {
  const systemPrompt = buildSystemPrompt(
    input.schemaName,
    input.schemaDescription
  );

  const userPrompt = `
JSON Schema:
${JSON.stringify(input.jsonSchema, null, 2)}

Input text:
"""
${input.inputText}
"""
`.trim();

  return {
    version: PROMPT_VERSION,
    system: systemPrompt,
    user: userPrompt
  };
}
