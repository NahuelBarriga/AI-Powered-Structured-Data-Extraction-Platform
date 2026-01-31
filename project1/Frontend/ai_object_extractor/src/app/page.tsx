"use client";

import { useState } from "react";
import InputForm from "@/src/components/InputForm";
import ErrorBox from "@/src/components/ErrorBox";
import { submitOrder } from "../lib/helpers/orderHelper";
import { useNavigation } from "@/src/lib/hooks/useNavigation";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      {error && (
        <ErrorBox 
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      <InputForm onSubmit={handleSubmit} loading={loading} />
    </main>
  );
}
