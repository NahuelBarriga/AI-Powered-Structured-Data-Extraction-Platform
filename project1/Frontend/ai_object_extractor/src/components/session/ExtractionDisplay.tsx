"use client";

import ConfidenceBadge from "../ConfidenceBadge";
import { Extraction, ExtractionDisplayProps } from "@/src/types/extraction.type";



export default function ExtractionDisplay({
  extraction,
  onCopy,
  copied,
}: ExtractionDisplayProps) {
  const { items, notes } = extraction.extractedData;

  return (
    <div className="mb-6">
      {/* Confidence/Uncertainty Badge */}
      {extraction.uncertaintyData && (
        <ConfidenceBadge uncertainty={extraction.uncertaintyData} />
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Extracted Order</h2>
        <button
          onClick={onCopy}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            copied
              ? "bg-green-500 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {copied ? "Copied!" : "Copy JSON"}
        </button>
      </div>

      {/* Items Display */}
      {items && Array.isArray(items) && items.length > 0 && (
        <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-3 text-black">Items:</h3>
          <div className="space-y-2">
            {items.map((item: any, index: number) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded border-l-4 border-blue-400"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Qty: {item.quantity}
                  </span>
                </div>
                {item.modifiers && (
                  <p className="text-sm text-gray-600">
                    Modifiers: {item.modifiers}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes Display */}
      {notes && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Notes</h3>
          <p className="text-gray-700">{notes}</p>
        </div>
      )}

      {/* JSON Display */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Full JSON Structure:</p>
        <pre className="bg-gray-100 text-black p-4 rounded text-xs overflow-x-auto border border-gray-300">
          {JSON.stringify(extraction.extractedData, null, 2)}
        </pre>
      </div>

      {/* Metadata */}
      <div className="mt-4 text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded">
        <p>
          <span className="font-semibold">Model:</span> {extraction.model}
        </p>
        <p>
          <span className="font-semibold">Attempts:</span> {extraction.attempts}
        </p>
        <p>
          <span className="font-semibold">Status:</span>{" "}
          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
            {extraction.status}
          </span>
        </p>
        <p>
          <span className="font-semibold">Created:</span>{" "}
          {new Date(extraction.createdAt).toLocaleString()}
        </p>
        <p>
          <span className="font-semibold">Input:</span>{" "}
          {extraction.inputText.substring(0, 100)}
          {extraction.inputText.length > 100 ? "..." : ""}
        </p>
      </div>
    </div>
  );
}
