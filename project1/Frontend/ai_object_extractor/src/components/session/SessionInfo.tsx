"use client";

import type { SessionInfoProps } from "@/src/shared/types/ui.types";

export default function SessionInfo({ sessionId, createdAt }: SessionInfoProps) {
  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h2 className="text-sm font-semibold text-blue-900 mb-2">Session Information</h2>
      <div className="space-y-1 text-sm text-blue-800">
        <p>
          <span className="font-semibold">Session ID:</span>{" "}
          <code className="bg-blue-100 px-2 py-1 rounded text-xs break-all">
            {sessionId}
          </code>
        </p>
        <p>
          <span className="font-semibold">Created:</span>{" "}
          {new Date(createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
