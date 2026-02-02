import type { JsonValue } from "@prisma/client/runtime/library";

export interface PromptBuildInput {
  schemaName: string;
  schemaDescription?: string;
  jsonSchema: object;
  inputText: string;
  lastExtraction?: JsonValue;
  inputMode?: "new" | "retry" | "refine";
  userId?: string;
}

export interface BuiltPrompt {
  system: string;
  user: string;
}
