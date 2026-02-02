"use client";

import type { ExtractionNavigationProps } from "@/src/shared/types/ui.types";

export default function ExtractionNavigation({
  currentIndex,
  totalExtractions,
  version,
  onPrevious,
  onNext,
}: ExtractionNavigationProps) {
  if (totalExtractions <= 1) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-gray-100 rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Extraction {currentIndex + 1} of {totalExtractions}
          {` (Version ${version})`}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex === totalExtractions - 1}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
