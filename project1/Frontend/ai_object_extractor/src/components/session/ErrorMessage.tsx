"use client";

import type { ErrorMessageProps } from "@/src/shared/types/ui.types";

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="text-red-500 mb-4 p-3 bg-red-50 border border-red-200 rounded">
      <p className="font-semibold mb-1">Error</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}
