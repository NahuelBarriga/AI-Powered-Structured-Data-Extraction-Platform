import type { PromptBuildInput, BuiltPrompt } from "./prompt.types";
import { PROMPT_VERSION, buildSystemPrompt } from "./promptVersions";

export function buildExtractionPrompt(input: PromptBuildInput): BuiltPrompt {
  const systemPrompt = buildSystemPrompt(
    input.schemaName,
    input.schemaDescription
  );

  const mode = input.inputMode || 'new';

  let userPrompt: string;

  if (mode === 'new') {
    // new extraction - standard prompt
    userPrompt = `
    JSON Schema:
    ${JSON.stringify(input.jsonSchema, null, 2)}

    Input text:
    """
    ${input.inputText}
    """
    `.trim();
  } else if (mode === 'retry') {
    // retry - include previous extraction 
    userPrompt = `
    JSON Schema:
    ${JSON.stringify(input.jsonSchema, null, 2)}

    Previous extraction (that had issues):
    ${input.lastExtraction || 'None'}

    Please try again with the same input text and fix any errors:
    """
    ${input.inputText}
    """
    `.trim();
  } else if (mode === 'refine') {
    // refine - merge previous extraction with new text
    userPrompt = `
    JSON Schema:
    ${JSON.stringify(input.jsonSchema, null, 2)}

    Previous extraction:
    ${input.lastExtraction || 'None'}

    New input text to incorporate:
    """
    ${input.inputText}
    """

    Please refine the previous extraction by incorporating the new input text.
    Merge the information intelligently, preserving valid data and adding/updating with new details.
    `.trim();
  } else {
    throw new Error(`Unknown input mode: ${mode}`);
  }

  return {
    system: systemPrompt,
    user: userPrompt
  };
}
