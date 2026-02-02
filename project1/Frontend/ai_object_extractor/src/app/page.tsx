"use client";

import { useState } from "react";
import InputForm from "@/src/components/InputForm";
import StreamingInputForm from "@/src/components/StreamingInputForm";
import ErrorBox from "@/src/components/ErrorBox";
import { submitOrder } from "../lib/helpers/orderHelper";
import { useNavigation } from "@/src/lib/hooks/useNavigation";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"classic" | "streaming">("classic");
  const { push } = useNavigation();

  async function handleSubmit(text: string) {
    setLoading(true);
    setError(null);

    try {
      const result = await submitOrder(text);
      if (result && result.sessionId) {
        push(`/results/${result.sessionId}`);
      } else {
        setError("Failed to extract order. Please try again.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Failed to process your order. Please check your input and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">
        AI Order Extraction
      </h1>

      {/* Mode Selector */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setMode("classic")}
          className={`px-4 py-2 rounded font-semibold transition-colors ${
            mode === "classic"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-200 hover:bg-gray-600"
          }`}
        >
          Classic Mode
        </button>
        <button
          onClick={() => setMode("streaming")}
          className={`px-4 py-2 rounded font-semibold transition-colors ${
            mode === "streaming"
              ? "bg-green-600 text-white"
              : "bg-gray-700 text-gray-200 hover:bg-gray-600"
          }`}
        >
          Streaming Mode
        </button>
      </div>

      {/* Mode Description */}
      <div className="mb-6 p-4 bg-gray-800 rounded border border-gray-700 text-sm text-gray-300">
        {mode === "classic" ? (
          <p>
            <strong>Classic Mode:</strong> Submit your order and wait for the complete response. Recommended for production use.
          </p>
        ) : (
          <p>
            <strong>Streaming Mode:</strong> Watch the JSON response build token-by-token in real-time! See validation results and confidence scores as they stream.
          </p>
        )}
      </div>

      {error && (
        <ErrorBox 
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {mode === "classic" ? (
        <InputForm onSubmit={handleSubmit} loading={loading} />
      ) : (
        <StreamingInputForm />
      )}
    </main>
  );
}
