"use client";

import React from "react";
import { useKit } from "@/context/KitProvider";

export function BriefPanel() {
  const { kit } = useKit();
  const brief = kit.brief || {};
  const role = kit.role || {};
  const hiring = kit.hiring || {};
  const questions = kit.questions || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
          <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-wide">
            Company Intelligence
          </span>
          <h2 className="font-serif text-2xl font-normal text-[var(--text)] mt-1 mb-3">
            {brief.company || "Target Company"}
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
            {brief.summary || "No overview available."}
          </p>

          {brief.culture_signals?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <h4 className="text-xs font-mono text-[var(--text)] uppercase mb-2">
                Team Culture & Engineering Signals
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-[var(--text-muted)]">
                {brief.culture_signals.map((sig: string, i: number) => (
                  <li key={i}>{sig}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
          <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-wide">
            Requirements & Competencies
          </span>
          <h2 className="font-serif text-xl font-normal text-[var(--text)] mt-1 mb-4">
            {role.title || "Target Role"}
          </h2>

          <div className="divide-y divide-[var(--border)]">
            {(role.requirements || []).map((req: any) => {
              const mappedCount = questions.filter((q: any) =>
                q.requirement_ids?.includes(req.id)
              ).length;

              return (
                <div key={req.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[var(--text)]">
                        {req.label || req.text}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase ${
                          req.priority === "required"
                            ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold"
                            : "bg-[var(--subtle-bg)] text-[var(--text-muted)]"
                        }`}
                      >
                        {req.priority}
                      </span>
                    </div>
                    {req.context && (
                      <p className="text-xs text-[var(--text-muted)]">{req.context}</p>
                    )}
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)] shrink-0 bg-[var(--subtle-bg)] px-2 py-0.5 rounded">
                    {mappedCount} {mappedCount === 1 ? "q" : "qs"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
          <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-wide">
            Hiring Process
          </span>
          <h3 className="font-serif text-xl font-normal text-[var(--text)] mt-1 mb-4">
            Evaluation Stages
          </h3>

          <div className="space-y-4">
            {(hiring.stages || []).map((stage: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <span className="font-mono text-xs text-[var(--accent)] bg-[var(--subtle-bg)] w-6 h-6 rounded flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-medium text-[var(--text)] text-xs">{stage.name}</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{stage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
