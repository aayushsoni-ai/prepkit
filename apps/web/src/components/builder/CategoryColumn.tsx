"use client";

import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AddItemRow } from "./AddItemRow";
import { QuestionCard } from "./QuestionCard";
import { Popover } from "@/components/ui/Popover";
import { Button } from "@/components/ui/Button";

export function CategoryColumn({
  category,
  title,
  questions,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddQuestion,
  onRegenerate
}: {
  category: string;
  title: string;
  questions: any[];
  onUpdateQuestion: (qId: string, updates: Record<string, unknown>) => void;
  onDeleteQuestion: (qId: string) => void;
  onAddQuestion: (category: string, question: string, guidance: string, difficulty: number) => Promise<void>;
  onRegenerate: (category: string) => void;
}) {
  const itemIds = questions.map((q) => q.id);

  return (
    <div className="flex flex-col bg-[var(--subtle-bg)]/40 border border-[var(--border)] rounded-lg p-3 sm:p-4 min-w-[280px] flex-1">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-base font-normal text-[var(--text)]">{title}</h3>
          <span className="font-mono text-xs text-[var(--text-muted)] bg-[var(--card-bg)] px-1.5 py-0.5 rounded border border-[var(--border)]">
            {questions.length}
          </span>
        </div>

        <Popover
          align="right"
          trigger={
            <button
              className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-1"
              title="Regenerate this category"
            >
              Regenerate
            </button>
          }
          content={(close) => (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-[var(--text)]">Regenerate Category?</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Unedited and unpinned questions will be replaced. Any edited or pinned questions are preserved.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={close}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    close();
                    onRegenerate(category);
                  }}
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        />
      </div>

      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 flex-1 min-h-[100px]">
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onUpdate={onUpdateQuestion}
              onDelete={onDeleteQuestion}
            />
          ))}
        </div>
      </SortableContext>

      <div className="mt-3 pt-2">
        <AddItemRow category={category} onAdd={onAddQuestion} />
      </div>
    </div>
  );
}
