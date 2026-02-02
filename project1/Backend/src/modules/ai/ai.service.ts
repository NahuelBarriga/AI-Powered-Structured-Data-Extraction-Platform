import { buildExtractionPrompt } from "./prompt/promptBuilder";
import { OrderSchema } from "./schemas/order.schema";
import orderJsonSchema from "../../infra/seeds/schemas/order.schema.json";
import { ExtractionError } from "../../shared/Errors/extractionError";
import type { ReqOrderDTO } from "../../shared/DTO/reqDTO";
import type { JsonValue } from "@prisma/client/runtime/library";
import { detectUncertainty } from "../control/uncertaintyDetector";
import type { LLMProvider } from "./providers/llmProvider.type";
import { sanitizeJson } from "../../shared/utils/json.sanitizer";
import type { ExtractionResult } from "../../shared/types/ai.types";

const MAX_CHAR_LENGTH = process.env.MAX_INPUT_LENGTH
  ? parseInt(process.env.MAX_INPUT_LENGTH)
  : 10000;

/**
 * Calculates approximate token count based on text length.
 * Uses a rough estimate of 1 token per 4 characters.
 * 
 * @param text - The input text to calculate tokens for
 * @returns Estimated token count
 */
export function calculateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Extracts structured order data from user input text using an LLM provider.
 * Validates input length, calls the LLM, parses JSON response, validates against Order schema,
 * and calculates confidence score based on multiple signals.
 * 
 * @param input - Request DTO containing text and mode
 * @param llm - LLM provider instance for generating extraction
 * @param userId - User ID for tracking and rate limiting
 * @param lastExtraction - Previous extraction data for retry mode (optional)
 * @param retries - Number of retry attempts made (used for confidence calculation)
 * @returns Extraction result with order data, token counts, and confidence score
 * @throws ExtractionError if input validation fails, LLM fails, JSON is invalid, or schema validation fails
 */
export async function extractOrderFromText(input: ReqOrderDTO, llm: LLMProvider,  userId: string, lastExtraction?: JsonValue, retries: number = 1): Promise<ExtractionResult> {
  

  if (input.text.length > MAX_CHAR_LENGTH) {
    throw new ExtractionError("Input text exceeds maximum length", "BUSINESS_RULE");
  }

  const promptInput = {
    schemaName: "Order",
    schemaDescription: "A purchase order with items, quantities, and notes.",
    jsonSchema: orderJsonSchema,
    inputText: input.text,
    lastExtraction: lastExtraction || '',
    inputMode: input.mode,
    userId: userId,
  };

  //build prompt
  const prompt = buildExtractionPrompt(promptInput);


  // call LLM
  const response = await llm
    .generate({
      systemPrompt:
        prompt.system,
      userPrompt: prompt.user,
      temperature: 0,
    })
    .catch((error) => { //TODO: fix error handling
      throw new ExtractionError("LLM call failed", "LLM_FAILURE", response.model);
    });
  // parse JSON
  let parsed: Record<string, unknown>; // Change type to Record<string, unknown>
  const outputSanitized = sanitizeJson(response.content);
  try {
    parsed = JSON.parse(outputSanitized) as Record<string, unknown>; // Assert type
  } catch {
    throw new ExtractionError("Invalid JSON returned by LLM", "INVALID_JSON", response.model, outputSanitized);
  }
  // sanitize response
  const sanitizedResponse = Object.fromEntries(Object.entries(parsed).filter(([_, v]) => v !== null));
  // validate schema
  const result = OrderSchema.safeParse(sanitizedResponse);


  if (!result.success) {
    console.error("Schema validation errors:", result.error.message);
    throw new ExtractionError(
      `LLM output does not match Order schema: ${JSON.stringify(result.error.message)}`,
      "SCHEMA_MISMATCH",
      response.model,
      outputSanitized
    );
  }

  // Calculate tokens
  const tokensIn = response.tokensIn ?? 0;
  const tokensOut = response.tokensOut ?? 0;

  // Detect uncertainty and potential hallucinations (now with retry and token signals)
  const uncertainty = detectUncertainty(result.data, input.text, retries, tokensIn, tokensOut);

  // Log warnings if confidence is low
  if (uncertainty.confidenceScore < 80) {
    console.warn(`Low confidence extraction (${uncertainty.confidenceScore}%):`, uncertainty.warnings);
  }

  // return typed data with token usage and uncertainty info
  return {
    order: result.data,
    tokensIn,
    tokensOut,
    model: response.model,
    uncertainty,
    retries,
  };
}
