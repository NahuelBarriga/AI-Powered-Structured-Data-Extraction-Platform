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

    Tenant-ID: ${input.userId}
    You are operating ONLY on this tenant's data.
    Never reference other sessions or users.

    Input text:
    """
    ${input.inputText}
    """

    Only return valid JSON that adheres to the provided schema. No explanations needed, just the JSON.
    `.trim();
  } else if (mode === 'retry') {
    // retry - include previous extraction 
    userPrompt = `
    JSON Schema:
    ${JSON.stringify(input.jsonSchema, null, 2)}
    
    Tenant-ID: ${input.userId}
    You are operating ONLY on this tenant's data.
    Never reference other sessions or users.

    Previous extraction (that had issues):
    ${input.lastExtraction || 'None'}

    Please try again with the same input text and fix any errors:
    """
    ${input.inputText}
    """
    Only return valid JSON that adheres to the provided schema. No explanations needed, just the JSON.
    `.trim();
  } else if (mode === 'refine') {
    console.log("Building refine prompt with last extraction:", input.lastExtraction); //!debug
    // refine - merge previous extraction with new text
    userPrompt = `
    JSON Schema:
    ${JSON.stringify(input.jsonSchema, null, 2)}
    
    Tenant-ID: ${input.userId}
    You are operating ONLY on this tenant's data.
    
    Never reference other sessions or users.
    Please refine the previous extraction by incorporating the new request by the user.
    Merge the information intelligently, preserving valid data and adding/updating with new details. If an item exists, update its details; do not duplicate it.
    Make sure the initial item and details are present unless explicitly removed/modified in the new input.

    Previous extraction:
    ${input.lastExtraction || 'None'}

    New request by the user:
    """
    ${input.inputText}
    """

   Only return valid JSON that adheres to the provided schema. No explanations needed, just the JSON.
    `.trim();
  } else {
    throw new Error(`Unknown input mode: ${mode}`);
  }

  return {
    system: systemPrompt,
    user: userPrompt
  };
}
