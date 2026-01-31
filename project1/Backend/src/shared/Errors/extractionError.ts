import type { JSONSchema } from "zod/v4/core/json-schema.cjs";

export class ExtractionError extends Error {
  constructor(
    message: string,
    public readonly reason:
    | "INVALID_JSON"
    | "SCHEMA_MISMATCH"
    | "BUSINESS_RULE"
    | "LLM_FAILURE",
    model?: string, 
    extraction?: string | JSONSchema,
  ) {
    super(message);
  }
}
