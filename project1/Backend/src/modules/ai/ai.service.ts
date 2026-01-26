import { createLLMProvider } from "./providers/llmFactory";
import { buildExtractionPrompt } from "./prompt/promptBuilder";
import { OrderSchema, Order } from "../schemas/order.schema";

export class AIExtractionError extends Error {
  constructor(message: string, public raw?: string) {
    super(message);
  }
}

export async function extractOrderFromText(
  input: string
): Promise<Order> {
  const llm = createLLMProvider();

  // 1. Build prompt
  const prompt = buildExtractionPrompt(input);

  // 2. Call LLM
  const response = await llm.generate({
    systemPrompt:
      "You are a system that extracts structured data. Output only valid JSON.",
    userPrompt: prompt,
    temperature: 0,
  });

  // 3. Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(response.content);
  } catch {
    throw new AIExtractionError(
      "Invalid JSON returned by LLM",
      response.content
    );
  }

  // 4. Validate schema
  const result = OrderSchema.safeParse(parsed);

  if (!result.success) {
    throw new AIExtractionError(
      "LLM output does not match Order schema",
      response.content
    );
  }

  // 5. Return typed data
  return result.data;
}
