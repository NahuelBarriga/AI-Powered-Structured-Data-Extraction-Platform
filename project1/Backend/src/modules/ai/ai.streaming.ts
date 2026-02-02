import { buildExtractionPrompt } from "./prompt/promptBuilder";
import { OrderSchema } from "./schemas/order.schema";
import orderJsonSchema from "../../infra/seeds/schemas/order.schema.json";
import { ExtractionError } from "../../shared/Errors/extractionError";
import { sanitizeJson } from "../../shared/utils/json.sanitizer";
import { detectUncertainty } from "../control/uncertaintyDetector";
import type { JsonValue } from "@prisma/client/runtime/library";
import type { ReqOrderDTO } from "../../shared/DTO/reqDTO";
import type { LLMProvider } from "./providers/llmProvider.type";
import type { StreamingExtractionResult } from "../../shared/types/ai.types";
import type { Order } from "./schemas/order.schema";

const MAX_CHAR_LENGTH = process.env.MAX_INPUT_LENGTH
  ? parseInt(process.env.MAX_INPUT_LENGTH)
  : 10000;

/**
 * Streams order extraction data token-by-token from an LLM provider.
 * Uses async generator pattern to yield tokens as they arrive, with optional JSON previews.
 * Performs strict schema validation after stream completes before saving to database.
 * 
 * @param input - Request DTO containing text and mode
 * @param llm - LLM provider instance that supports streaming (must have streamGenerate method)
 * @param userId - User ID for tracking and rate limiting
 * @param lastExtraction - Previous extraction data for retry mode (optional)
 * @param retries - Number of retry attempts made (used for confidence calculation)
 * @returns AsyncGenerator yielding token, preview, complete, and error events
 * 
 * @yields {object} Streaming events:
 *   - type: "token" - Individual token with accumulated content
 *   - type: "preview" - Valid JSON preview (non-blocking, optional)
 *   - type: "complete" - Stream finished with final validated result
 *   - type: "error" - Validation or processing error
 */
export async function* streamExtractOrderFromText(
  input: ReqOrderDTO,
  llm: LLMProvider,
  userId: string,
  lastExtraction?: JsonValue,
  retries: number = 1
): AsyncGenerator<{
  type: "token" | "preview" | "complete" | "error";
  content?: string;
  fullContent?: string;
  result?: StreamingExtractionResult;
  error?: string;
}> {
  // Validate input
  if (input.text.length > MAX_CHAR_LENGTH) {
    yield {
      type: "error",
      error: "Input text exceeds maximum length",
    };
    return;
  }

  // Check if LLM supports streaming
  if (!llm.streamGenerate) {
    yield {
      type: "error",
      error: "LLM provider does not support streaming",
    };
    return;
  }

  const promptInput = {
    schemaName: "Order",
    schemaDescription: "A purchase order with items, quantities, and notes.",
    jsonSchema: orderJsonSchema,
    inputText: input.text,
    lastExtraction: lastExtraction || "",
    inputMode: input.mode,
    userId: userId,
  };

  const prompt = buildExtractionPrompt(promptInput);

  let fullContent = "";
  let tokensIn = 0;
  let tokensOut = 0;
  let lastValidJson: string | null = null;

  try {
    // Stream tokens from LLM
    for await (const event of llm.streamGenerate({
      systemPrompt: "You are a system that extracts structured data. Output only valid JSON.",
      userPrompt: prompt.user,
      temperature: 0,
    })) {
      // Yield each token as it comes in
      if (!event.isComplete && event.token) {
        fullContent += event.token;
        yield {
          type: "token",
          content: event.token,
          fullContent: fullContent,
        };

        // Try to parse and preview valid JSON (don't fail, just send previews)
        try {
          const sanitized = sanitizeJson(fullContent);
          // Only yield preview if it looks like valid JSON
          if (sanitized.startsWith("{") && sanitized.includes("}")) {
            const parsed = JSON.parse(sanitized);
            yield {
              type: "preview",
              fullContent: fullContent,
              result: {
                order: parsed as Order,
                tokensIn: 0,
                tokensOut: 0,
                model: event.fullContent ? "" : "",
              },
            };
          }
        } catch {
          // Preview parsing failed, continue streaming (don't error)
        }
      }

      // When stream completes
      if (event.isComplete) {
        tokensIn = event.tokensIn ?? 0;
        tokensOut = event.tokensOut ?? 0;
        fullContent = event.fullContent || fullContent;
      }
    }

    // ============ STRICT JSON VALIDATION AT END ============
    const outputSanitized = sanitizeJson(fullContent);
    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(outputSanitized) as Record<string, unknown>;
    } catch (error) {
      yield {
        type: "error",
        error: `Stream completed but JSON is invalid. Content: ${fullContent.substring(0, 200)}...`,
      };
      return;
    }

    // Sanitize response
    const sanitizedResponse = Object.fromEntries(
      Object.entries(parsed).filter(([_, v]) => v !== null)
    );

    // ============ STRICT SCHEMA VALIDATION AT END ============
    const result = OrderSchema.safeParse(sanitizedResponse);

    if (!result.success) {
      yield {
        type: "error",
        error: `Schema validation failed: ${JSON.stringify(result.error.message)}`,
      };
      return;
    }

    // Calculate confidence with all signals
    const uncertainty = detectUncertainty(
      result.data,
      input.text,
      retries,
      tokensIn,
      tokensOut
    );

    // Log warnings if confidence is low
    if (uncertainty.confidenceScore < 80) {
      console.warn(
        `Low confidence extraction (${uncertainty.confidenceScore}%):`,
        uncertainty.warnings
      );
    }

    // Yield final complete result
    yield {
      type: "complete",
      result: {
        order: result.data,
        tokensIn,
        tokensOut,
        model: (llm as any).model || process.env.LLM_PROVIDER || "unknown",
        uncertainty,
      },
    };
  } catch (error) {
    yield {
      type: "error",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during streaming extraction",
    };
  }
}
