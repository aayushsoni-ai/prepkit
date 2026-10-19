"use client";

import React from "react";
import { useKit } from "@/context/KitProvider";
import { Button } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Popover";

export function ScheduleView() {
  const { kit, regenerate } = useKit();
  const scheduleDays = Array.isArray(kit.schedule?.days)
    ? kit.schedule.days
    : Array.isArray((kit.schedule as any)?.plan)
    ? (kit.schedule as any).plan
    : [];
  const totalDays = kit.days_available || scheduleDays.length;
  const questions = kit.questions || [];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="font-serif text-2xl font-normal text-[var(--text)]">
            {totalDays}-Day Study Roadmap
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Structured daily allocation based on requirement priorities and category weights.
          </p>
        </div>

        <Popover
          align="right"
          trigger={
            <Button variant="secondary" size="sm">
              Regenerate Schedule
            </Button>
          }
          content={(close) => (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-[var(--text)]">Recompute Schedule?</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Recomputes optimal day allocation for all questions currently in the kit.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={close}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    close();
                    await regenerate("schedule");
                  }}
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        />
      </div>

      <div className="space-y-4">
        {scheduleDays.map((day: any) => {
          const dayQuestions = (day.question_ids || [])
            .map((qid: string) => questions.find((q: any) => q.id === qid))
            .filter(Boolean);

          return (
            <div
              key={day.day}
              className="p-5 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded">
                    Day {day.day}
                  </span>
                  <h3 className="font-medium text-sm text-[var(--text)]">{day.focus}</h3>
                </div>
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  {dayQuestions.length} {dayQuestions.length === 1 ? "question" : "questions"}
                </span>
              </div>

              <div className="divide-y divide-[var(--border)] pt-1">
                {dayQuestions.map((q: any) => (
                  <div key={q.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                    <span className="text-[var(--text)]">{q.question}</span>
                    <span className="font-mono text-[10px] text-[var(--text-faint)] uppercase shrink-0">
                      {q.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
