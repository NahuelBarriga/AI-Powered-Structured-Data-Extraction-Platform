"use client";

import type { ErrorBoxProps } from "@/src/shared/types/ui.types";

export default function ErrorBox({ message, onDismiss }: ErrorBoxProps) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-red-800 font-semibold text-lg mb-1">
            Something went wrong
          </h3>
          <p className="text-red-700 text-sm leading-relaxed">
            {message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-red-500 hover:text-red-700 font-bold"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
