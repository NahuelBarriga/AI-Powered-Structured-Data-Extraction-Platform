import type { PromptBuildInput, BuiltPrompt } from "./prompt.types";
import { PROMPT_VERSION, buildSystemPrompt } from "./promptVersions";

export function buildExtractionPrompt(input: PromptBuildInput): BuiltPrompt {
  const systemPrompt = buildSystemPrompt(
    input.schemaName,
    input.schemaDescription
  );

  const mode = input.inputMode || "new";

  let userPrompt: string;

  if (mode === "new") {
    userPrompt = `
  MODE: NEW

  JSON Schema:
  ${JSON.stringify(input.jsonSchema, null, 2)}

  Tenant-ID: ${input.userId}
  You are operating ONLY on this tenant's data.
  Never reference other sessions or users.

  Input text:
  """
  ${input.inputText}
  """
  `.trim();
    } else if (mode === "retry") {
      userPrompt = `
  MODE: RETRY

  JSON Schema:
  ${JSON.stringify(input.jsonSchema, null, 2)}

  Tenant-ID: ${input.userId}
  You are operating ONLY on this tenant's data.
  Never reference other sessions or users.

  Previous extraction:
  ${JSON.stringify(input.lastExtraction, null, 2) || "None"}

  Input text:
  """
  ${input.inputText}
  """
  `.trim();
    } else if (mode === "refine") {
      userPrompt = `
  MODE: REFINE

  JSON Schema:
  ${JSON.stringify(input.jsonSchema, null, 2)}

  Tenant-ID: ${input.userId}
  You are operating ONLY on this tenant's data.
  Never reference other sessions or users.

  Previous extraction:
  ${JSON.stringify(input.lastExtraction, null, 2) || "None"}

  New user request:
  """
  ${input.inputText}
  """
  `.trim();
  } else {
    throw new Error(`Unknown input mode: ${mode}`);
  }

  return {
    system: systemPrompt,
    user: userPrompt
  };
}
