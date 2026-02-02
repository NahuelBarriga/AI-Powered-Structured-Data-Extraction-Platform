import apiClient from "@/src/lib/api";
import type { StreamingEvent } from "@/src/shared/types/streaming.types";

const api = apiClient.api;

/**
 * Submits order data for streaming (token-by-token) extraction via Server-Sent Events.
 * Uses Fetch API with Response.body.getReader() to handle streaming response.
 * Parses SSE "data: {json}" format and calls callback for each event.
 * 
 * @param orderData - Raw text containing order information
 * @param onEvent - Callback function invoked for each streaming event (token, preview, complete, error, saved)
 * @param sessionId - Optional session ID for retry mode
 * @param mode - Optional extraction mode ("new" or "retry")
 * @returns Promise resolving when streaming completes successfully
 * @throws Error if stream fails to start, stream is interrupted, or processing fails
 * 
 * Events yielded to onEvent callback:
 * - type: "token" - Single token from LLM with accumulated content
 * - type: "preview" - Valid JSON preview as it becomes parseable
 * - type: "complete" - Stream finished with final validated result
 * - type: "error" - Processing error (validation, schema, etc)
 * - type: "saved" - Successfully saved to database with extraction ID
 */
export const submitOrderStream = async (
  orderData: string,
  onEvent: (event: StreamingEvent) => void,
  sessionId?: string,
  mode?: string
): Promise<any> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/order/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies for authentication
      body: JSON.stringify({
        text: orderData,
        mode: mode ? mode : sessionId ? "retry" : "new",
        sessionId: sessionId,
      }),
    });

    if (!response.ok) {
      let errorMessage = "Unable to start streaming. Please try again.";
      try {
        const errorBody = await response.json();
        if (errorBody?.error && typeof errorBody.error === "string") {
          errorMessage = errorBody.error;
        }
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response has no body");
    }

    return new Promise((resolve, reject) => {
      const processChunk = async () => {
        try {
          const { done, value } = await reader.read();

          if (done) {
            resolve({ success: true });
            return;
          }

          const text = decoder.decode(value, { stream: true });
          // Handle multiple SSE messages in the chunk
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6); // Remove "data: " prefix
              if (jsonStr.trim()) {
                try {
                  const data: StreamingEvent = JSON.parse(jsonStr);
                  onEvent(data);

                  if (data.type === "error") {
                    reader.cancel();
                    reject(new Error(data.error || "Unknown streaming error"));
                    return;
                  } else if (data.type === "complete" || data.type === "saved") {
                    // Continue reading in case there's a saved event after complete
                    // resolve(data);
                  }
                } catch (parseError) {
                  console.error("Failed to parse event:", jsonStr, parseError);
                }
              }
            }
          }

          await processChunk();
        } catch (error) {
          reader.cancel();
          reject(error);
        }
      };

      processChunk().catch(reject);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stream request failed";
    throw new Error(message);
  }
};
