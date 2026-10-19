"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { useKit } from "@/context/KitProvider";
import { Button } from "@/components/ui/Button";

export function WeakSpotsReport({ onStartDrill }: { onStartDrill: (reqIds: string[]) => void }) {
  const { kit } = useKit();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.practice
      .mastery(kit.id)
      .then((res: any) => setReport(res.report))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [kit.id]);

  if (loading) {
    return <div className="p-8 text-center text-xs font-mono">Analyzing retention & weak spots...</div>;
  }

  const breakdown = report?.breakdown || [];
  const overall = report?.overall_mastery || 0;
  const weakReqs = breakdown.filter((b: any) => b.mastery_score < 0.6);

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-wide">
            Retention & Mastery
          </span>
          <h2 className="font-serif text-3xl font-normal text-[var(--text)] mt-1">
            {Math.round(overall * 100)}% Readiness
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Based on active recall flashcard history and spaced repetition decay.
          </p>
        </div>

        {weakReqs.length > 0 && (
          <Button
            variant="primary"
            onClick={() => onStartDrill(weakReqs.map((w: any) => w.requirement_id))}
          >
            Drill {weakReqs.length} Weak Spots
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-serif text-xl font-normal text-[var(--text)]">
          Competency Breakdown
        </h3>

        <div className="border border-[var(--border)] rounded-lg bg-[var(--card-bg)] divide-y divide-[var(--border)]">
          {breakdown.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--text-muted)]">
              Practice flashcards to generate your weak-spots analytics.
            </div>
          ) : (
            breakdown.map((item: any) => {
              const scorePct = Math.round(item.mastery_score * 100);
              const isWeak = item.mastery_score < 0.6;

              return (
                <div key={item.requirement_id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text)]">{item.label}</span>
                      {isWeak && (
                        <span className="text-[10px] font-mono uppercase bg-[var(--accent-subtle)] text-[var(--accent)] px-1.5 py-0.5 rounded font-semibold">
                          Needs Practice
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {item.cards_reviewed} of {item.total_cards} cards reviewed
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-48">
                    <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                        style={{ width: `${scorePct}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-[var(--text-muted)] w-10 text-right">
                      {scorePct}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
