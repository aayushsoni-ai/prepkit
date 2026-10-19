"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

export function AddItemRow({
  category,
  onAdd
}: {
  category: string;
  onAdd: (category: string, question: string, guidance: string, difficulty: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [guidance, setGuidance] = useState("");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      await onAdd(category, question.trim(), guidance.trim(), difficulty);
      setQuestion("");
      setGuidance("");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2 border border-dashed border-[var(--border)] rounded text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors cursor-pointer"
      >
        + Add Question
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-md flex flex-col gap-2">
      <input
        type="text"
        required
        placeholder="Enter question text..."
        className="w-full text-xs p-1.5 border border-[var(--border)] rounded bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <textarea
        rows={2}
        placeholder="Interviewer guidance / answer expectations..."
        className="w-full text-xs p-1.5 border border-[var(--border)] rounded bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] resize-none"
        value={guidance}
        onChange={(e) => setGuidance(e.target.value)}
      />
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[var(--text-muted)] text-[10px]">Diff:</span>
          {([1, 2, 3] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                difficulty === d ? "bg-[var(--accent)] text-white" : "bg-[var(--subtle-bg)] text-[var(--text-muted)]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            Add
          </Button>
        </div>
      </div>
    </form>
  );
}
