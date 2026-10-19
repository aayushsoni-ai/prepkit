"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { InlineText } from "./InlineText";

export interface QuestionCardProps {
  question: any;
  onUpdate: (qId: string, updates: Record<string, unknown>) => void;
  onDelete: (qId: string) => void;
}

export function QuestionCard({ question, onUpdate, onDelete }: QuestionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
    data: { question }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  };

  const difficultyDots = Array.from({ length: 3 }).map((_, i) => (
    <span
      key={i}
      className={`inline-block w-1.5 h-1.5 rounded-full ${
        i < question.difficulty ? "bg-[var(--accent)]" : "bg-[var(--border)]"
      }`}
    />
  ));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3.5 bg-[var(--card-bg)] border border-[var(--border)] rounded-md shadow-xs flex flex-col gap-2 relative group"
    >
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-[var(--text-faint)] hover:text-[var(--text)] p-0.5"
            aria-label="Drag to reorder"
          >
            ⋮⋮
          </button>
          <div className="flex items-center gap-1" title={`Difficulty: ${question.difficulty}/3`}>
            {difficultyDots}
          </div>
          <span className="font-mono text-[10px] uppercase text-[var(--text-faint)]">
            {question.origin}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdate(question.id, { pinned: !question.pinned })}
            className={`p-1 rounded cursor-pointer transition-colors text-xs ${
              question.pinned
                ? "text-[var(--accent)] font-bold bg-[var(--accent-subtle)]"
                : "text-[var(--text-faint)] hover:text-[var(--text)]"
            }`}
            title={question.pinned ? "Pinned (will not be replaced on regenerate)" : "Pin question"}
          >
            {question.pinned ? "Pinned" : "Pin"}
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="text-[var(--text-faint)] hover:text-[var(--accent)] p-1 text-xs cursor-pointer"
            aria-label="Delete question"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="text-sm font-medium text-[var(--text)] leading-snug">
        <InlineText
          value={question.question}
          onSave={(val) => onUpdate(question.id, { question: val })}
        />
      </div>

      <div className="text-xs text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)] pt-2">
        <InlineText
          value={question.guidance}
          multiline
          placeholder="Add interviewer guidance..."
          onSave={(val) => onUpdate(question.id, { guidance: val })}
        />
      </div>
    </div>
  );
}
