"use client";

import { useState } from "react";

export default function InputForm({
  onSubmit,
  loading,
}: {
  onSubmit: (text: string) => void;
  loading: boolean;
}) {
  const [text, setText] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(text);
      }}
      className="space-y-4"
    >
      <textarea
        className="w-full border rounded p-3"
        rows={6}
        placeholder="Paste or type the order text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading || !text}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Processing…" : "Extract Order"}
      </button>
    </form>
  );
}
