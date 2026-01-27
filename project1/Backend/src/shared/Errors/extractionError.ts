export class ExtractionError extends Error {
  constructor(
    message: string,
    public readonly reason:
      | "INVALID_JSON"
      | "SCHEMA_MISMATCH"
      | "BUSINESS_RULE"
      | "LLM_FAILURE"
  ) {
    super(message);
  }
}
