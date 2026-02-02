import type { JSONSchema } from "zod/v4/core/json-schema.cjs";

/**
 * Custom error class for extraction-related failures.
 * Extends Error with context about why extraction failed.
 */
export class ExtractionError extends Error {
  /**
   * Creates a new extraction error.
   * 
   * @param message - Human-readable error message
   * @param reason - Error category (INVALID_JSON, SCHEMA_MISMATCH, BUSINESS_RULE, LLM_FAILURE)
   * @param model - Optional LLM model name that generated the error
   * @param extraction - Optional raw extraction/schema data for debugging
   */
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
