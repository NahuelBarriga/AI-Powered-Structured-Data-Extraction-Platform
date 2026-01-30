"use client";

import { useState } from "react";
import InputForm from "@/src/components/InputForm";
import { extractText } from "@/src/lib/api";

export default function ResultsPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const { sessionId } = params;
  const [output, setOutput] = useState<any>(null);
  const [status, setStatus] = useState<
    "idle" | "thinking" | "done" | "error"
  >("idle");

  async function refine(text: string) {
    setStatus("thinking");

    try {
      const res = await extractText(text, sessionId);
      setOutput(res);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">
        Extracted Order
      </h2>

      {status === "thinking" && <p>AI is thinking…</p>}
      {status === "error" && (
        <p className="text-red-500">Something went wrong.</p>
      )}

      {output && (
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {JSON.stringify(output.data, null, 2)}
        </pre>
      )}

      <div className="mt-6">
        <InputForm onSubmit={refine} loading={status === "thinking"} />
      </div>
    </main>
  );
}
