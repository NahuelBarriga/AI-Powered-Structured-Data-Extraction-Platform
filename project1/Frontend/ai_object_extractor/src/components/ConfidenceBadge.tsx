"use client";

import type { ConfidenceBadgeProps } from "@/src/shared/types/ui.types";

export default function ConfidenceBadge({ uncertainty, score }: ConfidenceBadgeProps) {
  const confidenceScore = score ?? uncertainty?.confidenceScore;
  const warnings = uncertainty?.warnings ?? [];

  if (confidenceScore === undefined) {
    return null;
  }

  // Determine confidence level and styling
  let bgColor = "bg-green-100";
  let textColor = "text-green-800";
  let borderColor = "border-green-300";
  let level = "High Confidence";
  let icon = "✓";

  if (confidenceScore < 50) {
    bgColor = "bg-red-100";
    textColor = "text-red-800";
    borderColor = "border-red-300";
    level = "Low Confidence";
    icon = "⚠️";
  } else if (confidenceScore < 80) {
    bgColor = "bg-yellow-100";
    textColor = "text-yellow-800";
    borderColor = "border-yellow-300";
    level = "Medium Confidence";
    icon = "⚡";
  }

  return (
    <div className={`mb-4 p-4 rounded-lg border-2 ${bgColor} ${borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className={`font-semibold ${textColor}`}>
            {level} ({confidenceScore}%)
          </h3>
        </div>
        {/* Progress bar */}
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              confidenceScore >= 80
                ? "bg-green-500"
                : confidenceScore >= 50
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${confidenceScore}%` }}
          />
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mt-3">
          <p className={`text-sm font-semibold mb-2 ${textColor}`}>
            Potential Issues:
          </p>
          <ul className={`text-sm space-y-1 ${textColor}`}>
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {confidenceScore < 80 && (
        <div className={`mt-3 text-xs ${textColor} italic`}>
          💡 Tip: Try adding more details or use the "Refine" feature to improve accuracy
        </div>
      )}
    </div>
  );
}
