"use client";

import type { ActionButtonsProps } from "@/src/shared/types/ui.types";

export default function ActionButtons({
  onRetry,
  onNewExtraction,
  loading,
  disabled,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-3 mb-6">
      <button
        onClick={onRetry}
        disabled={loading || disabled}
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {loading ? "Processing..." : "Retry"}
      </button>
      <button
        onClick={onNewExtraction}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-medium transition-colors"
      >
        New Extraction
      </button>
    </div>
  );
}
