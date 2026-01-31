"use client";

import { useState } from "react";

export default function InputForm({
  onSubmit,
  loading,
  placeholder = "Paste or type the order text here...",
}: {
  onSubmit: (text: string) => void;
  loading: boolean;
  placeholder?: string;
}) {
  const [text, setText] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(text);
        setText("");
      }}
      className="space-y-4"
    >
      <textarea
        className="w-full border rounded p-3"
        rows={6}
        placeholder={placeholder}
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
