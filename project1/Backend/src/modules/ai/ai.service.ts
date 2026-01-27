import { createLLMProvider } from "./providers/llmFactory";
import { buildExtractionPrompt } from "./prompt/promptBuilder";
import type { Order } from "./schemas/order.schema";
import { OrderSchema } from "./schemas/order.schema";
import orderJsonSchema from "../../infra/db/seeds/schemas/order.schema.json";
export class AIExtractionError extends Error {
  constructor(message: string, public raw?: string) {
    super(message);
  }
}

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
  const response = await llm.generate({
    systemPrompt:
      "You are a system that extracts structured data. Output only valid JSON.",
    userPrompt: prompt.user,
    temperature: 0,
  });

  // parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(response.content);
  } catch {
    throw new AIExtractionError(
      "Invalid JSON returned by LLM",
      response.content
    );
  }

  // validate schema
  const result = OrderSchema.safeParse(parsed);

  if (!result.success) {
    throw new AIExtractionError(
      "LLM output does not match Order schema",
      response.content
    );
  }

  // return typed data
  return result.data;
}
