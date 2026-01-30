import { createLLMProvider } from "./providers/llmFactory";
import { buildExtractionPrompt } from "./prompt/promptBuilder";
import type { Order } from "./schemas/order.schema";
import { OrderSchema } from "./schemas/order.schema";
import orderJsonSchema from "../../infra/seeds/schemas/order.schema.json";
import { ExtractionError } from "../../shared/Errors/extractionError";
import type { ReqOrderDTO } from "../../shared/DTO/reqDTO";

const MAX_CHAR_LENGTH = process.env.MAX_INPUT_LENGTH
  ? parseInt(process.env.MAX_INPUT_LENGTH)
  : 10000;

export interface ExtractionResult {
  order: Order;
  tokensIn: number;
  tokensOut: number;
  model: string;
}

// calculate tokens roughly 1 token per 4 characters
export function calculateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function extractOrderFromText(input: ReqOrderDTO, lastExtraction?: string, userId?: string): Promise<ExtractionResult> {
  const llm = createLLMProvider(); //TODO: make it dynamic?

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
        "You are a system that extracts structured data. Output only valid JSON.",
      userPrompt: prompt.user,
      temperature: 0,
    })
    .catch((error) => { //!fix error handling
      throw new ExtractionError("LLM call failed", "LLM_FAILURE");
    });
  // parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(response.content);
  } catch {
    throw new ExtractionError("Invalid JSON returned by LLM", "INVALID_JSON");
  }
  console.log("Parsed LLM response:", parsed); //!debug
  // validate schema
  const result = OrderSchema.safeParse(parsed);

  if (!result.success) {
    console.error("Schema validation errors:", result.error.message);
    throw new ExtractionError(
      `LLM output does not match Order schema: ${JSON.stringify(result.error.message)}`,
      "SCHEMA_MISMATCH"
    );
  }

  // Calculate tokens
  const tokensIn = response.tokensIn ?? calculateTokens(prompt.user + (prompt.system || ''));
  const tokensOut = response.tokensOut ?? calculateTokens(response.content);

  // return typed data with token usage
  return {
    order: result.data,
    tokensIn,
    tokensOut,
    model: response.model,
  };
}
