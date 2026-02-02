"use client";

import { useState } from "react";
import { submitOrderStream } from "@/src/lib/helpers/orderStreamHelper";
import { useNavigation } from "@/src/lib/hooks/useNavigation";
import ConfidenceBadge from "./ConfidenceBadge";

interface StreamingState {
  tokens: string;
  fullContent: string;
  preview: any | null;
  validationError: string | null;
  extractionId: string | null;
  sessionId: string | null;
}

export default function StreamingInputForm({
  placeholder = "Paste or type the order text here...",
}: {
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState<StreamingState>({
    tokens: "",
    fullContent: "",
    preview: null,
    validationError: null,
    extractionId: null,
    sessionId: null,
  });
  const { push } = useNavigation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStreaming({
      tokens: "",
      fullContent: "",
      preview: null,
      validationError: null,
      extractionId: null,
      sessionId: null,
    });

    try {
      const result = await submitOrderStream(
        text,
        (event) => {
          if (event.type === "token") {
            setStreaming((prev) => ({
              ...prev,
              tokens: prev.tokens + (event.content || ""),
              fullContent: event.fullContent || "",
            }));
          } else if (event.type === "preview") {
            setStreaming((prev) => ({
              ...prev,
              preview: event.result,
            }));
          } else if (event.type === "complete") {
            setStreaming((prev) => ({
              ...prev,
              preview: event.result,
            }));
          } else if (event.type === "error") {
            setStreaming((prev) => ({
              ...prev,
              validationError: event.error || "Validation failed",
            }));
          } else if (event.type === "saved") {
            setStreaming((prev) => ({
              ...prev,
              extractionId: event.extractionId || null,
              sessionId: event.sessionId || null,
            }));
          }
        }
      );

      if (result.sessionId) {
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
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full text-black bg-white border rounded p-3"
          rows={6}
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !text}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Processing (Streaming)…" : "Extract Order (Streaming)"}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {streaming.validationError && (
        <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded">
          <strong>Validation Error:</strong> {streaming.validationError}
          {streaming.fullContent && (
            <details className="mt-2 text-xs">
              <summary>View raw response</summary>
              <pre className="bg-white p-2 mt-2 overflow-auto max-h-32">
                {streaming.fullContent}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Live Token Stream Display */}
      {loading && streaming.fullContent && (
        <div className="bg-gray-900 border border-gray-700 rounded p-4">
          <p className="text-xs text-gray-400 mb-2">Live JSON Stream:</p>
          <pre className="text-green-400 text-xs overflow-auto max-h-40 whitespace-pre-wrap wrap-break-word">
            {streaming.fullContent}
          </pre>
          <p className="text-xs text-gray-500 mt-2">
            {streaming.tokens.length} characters streamed...
          </p>
        </div>
      )}

      {/* JSON Preview (updates as valid JSON is detected) */}
      {streaming.preview && !streaming.validationError && (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <p className="text-sm font-semibold text-green-800 mb-2">
            ✓ Valid JSON Preview
          </p>
          
          {streaming.preview.uncertainty && (
            <div className="mb-3">
              <ConfidenceBadge
                score={streaming.preview.uncertainty.confidenceScore}
              />
              {streaming.preview.uncertainty.warnings && streaming.preview.uncertainty.warnings.length > 0 && (
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer text-gray-700">
                    {streaming.preview.uncertainty.warnings.length} warnings
                  </summary>
                  <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                    {streaming.preview.uncertainty.warnings.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          <div className="bg-white p-3 rounded text-xs overflow-auto max-h-48">
            <p><strong>Items:</strong> {streaming.preview.order?.items?.length || 0}</p>
            {streaming.preview.order?.customer_name && (
              <p><strong>Customer:</strong> {streaming.preview.order.customer_name}</p>
            )}
            {streaming.preview.order?.items && (
              <div className="mt-2">
                <strong>Items:</strong>
                <ul className="list-disc list-inside ml-2">
                  {streaming.preview.order.items.slice(0, 3).map((item: any, i: number) => (
                    <li key={i}>
                      {item.name} x{item.quantity}
                    </li>
                  ))}
                  {streaming.preview.order.items.length > 3 && (
                    <li>... and {streaming.preview.order.items.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success message after saving */}
      {streaming.extractionId && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800">
          ✓ Extraction saved successfully! (ID: {streaming.extractionId.substring(0, 8)}...)
          <br />
          <span className="text-xs text-gray-600 mt-2 block">Redirecting to results page...</span>
        </div>
      )}
    </div>
  );
}
