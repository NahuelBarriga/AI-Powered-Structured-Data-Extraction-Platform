export interface ParsedAIResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: unknown;
}
