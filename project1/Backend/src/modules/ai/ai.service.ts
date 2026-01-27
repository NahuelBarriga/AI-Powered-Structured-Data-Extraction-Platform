import { createLLMProvider } from "./providers/llmFactory";
import { buildExtractionPrompt } from "./prompt/promptBuilder";
import type { Order } from "./schemas/order.schema";
import { OrderSchema } from "./schemas/order.schema";
import orderJsonSchema from "../../infra/db/seeds/schemas/order.schema.json";
import { ExtractionError } from "../../shared/Errors/extractionError";

export async function extractOrderFromText(
  input: string
): Promise<Order> {
  const llm = createLLMProvider(); //todo: make it dynamic?

  const promptInput = {
    schemaName: "Order",
    schemaDescription: "A purchase order with items, quantities, and notes.",
    jsonSchema: orderJsonSchema,
    inputText: input,
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
    .catch((error) => {
      throw new ExtractionError("LLM call failed", "LLM_FAILURE");
    });
  // parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(response.content);
  } catch {
    throw new ExtractionError("Invalid JSON returned by LLM", "INVALID_JSON");
  }

  // validate schema
  const result = OrderSchema.safeParse(parsed);

  if (!result.success) {
    throw new ExtractionError(
      "LLM output does not match Order schema",
      "SCHEMA_MISMATCH"
    );
  }

  // return typed data
  return result.data;
}
