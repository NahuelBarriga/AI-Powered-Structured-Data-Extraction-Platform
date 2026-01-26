import Ajv from "ajv";
import type { ValidationResult } from "./response.types";

const ajv = new Ajv({ allErrors: true });

export function validateAgainstSchema(
  data: unknown,
  jsonSchema: object
): ValidationResult {
  const validate = ajv.compile(jsonSchema);
  const isValid = validate(data);

  if (!isValid) {
    return {
      isValid: false,
      errors: validate.errors
    };
  }

  return {
    isValid: true
  };
}
