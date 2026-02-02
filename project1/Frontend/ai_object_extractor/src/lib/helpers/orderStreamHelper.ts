import apiClient from "@/src/lib/api";

const api = apiClient.api;

interface StreamingEvent {
  type: "token" | "preview" | "complete" | "error" | "saved";
  content?: string;
  fullContent?: string;
  result?: any;
  error?: string;
  extractionId?: string;
  sessionId?: string;
}

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
      throw new Error(`HTTP error! status: ${response.status}`);
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
