"use client";

import { useState } from "react";
import InputForm from "@/src/components/InputForm";
import { submitOrder } from "../lib/helpers/orderHelper";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(text: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await submitOrder(text);
      window.location.href = `/results/${res.sessionId}`;
    } catch {
      setError("Failed to extract order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        AI Order Extraction
      </h1>

      <InputForm onSubmit={handleSubmit} loading={loading} />

      {error && (
        <p className="text-red-500 mt-4">{error}</p>
      )}
    </main>
  );
}
