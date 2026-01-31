"use client";

import InputForm from "../InputForm";

interface RefineSectionProps {
  onSubmit: (text: string) => void;
  loading: boolean;
}

export default function RefineSection({
  onSubmit,
  loading,
}: RefineSectionProps) {
  return (
    <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold mb-2">Refine Extraction</h3>
      <p className="text-sm text-gray-600 mb-4">
        Add more text or corrections to refine the extraction. The AI will use
        the previous extraction as context.
      </p>
      <InputForm
        onSubmit={onSubmit}
        loading={loading}
        placeholder="Add additional text or corrections..."
      />
    </div>
  );
}
