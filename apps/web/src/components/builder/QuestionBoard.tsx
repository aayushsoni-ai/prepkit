"use client";

import React, { useState } from "react";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useKit } from "@/context/KitProvider";
import { CategoryColumn } from "./CategoryColumn";
import { Button } from "@/components/ui/Button";

const CATEGORIES = [
  { id: "technical", title: "Technical" },
  { id: "architecture", title: "System & Architecture" },
  { id: "communication", title: "Behavioral & Communication" },
  { id: "culture", title: "Culture & Leadership" }
];

export function QuestionBoard() {
  const { kit, patchQuestion, addQuestion, deleteQuestion, reorderQuestion, regenerate, undo, saving } = useKit();
  const [lastRegenerated, setLastRegenerated] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const overQuestion = kit.questions.find((q: any) => q.id === over.id);
    const targetCategory = overQuestion ? overQuestion.category : undefined;
    reorderQuestion(String(active.id), String(over.id), targetCategory);
  };

  const handleRegenerateCategory = async (cat: string) => {
    await regenerate(undefined, cat);
    setLastRegenerated(cat);
  };

  return (
    <div className="flex flex-col gap-6">
      {lastRegenerated && (
        <div className="p-3 bg-[var(--card-bg)] border border-[var(--border-dark)] rounded-md flex items-center justify-between text-xs">
          <span>
            Regenerated <strong>{lastRegenerated}</strong> category. Edited and pinned questions were preserved.
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                await undo();
                setLastRegenerated(null);
              }}
            >
              Undo
            </Button>
            <button
              onClick={() => setLastRegenerated(null)}
              className="text-[var(--text-faint)] hover:text-[var(--text)] ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {saving && (
        <div className="fixed top-20 right-6 z-40 bg-[var(--card-bg)] border border-[var(--border)] px-3 py-1 rounded text-xs font-mono text-[var(--text-muted)] flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          Saving changes...
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {CATEGORIES.map((cat) => {
            const columnQuestions = (kit.questions || []).filter((q: any) => q.category === cat.id);
            return (
              <CategoryColumn
                key={cat.id}
                category={cat.id}
                title={cat.title}
                questions={columnQuestions}
                onUpdateQuestion={patchQuestion}
                onDeleteQuestion={deleteQuestion}
                onAddQuestion={addQuestion}
                onRegenerate={handleRegenerateCategory}
              />
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
