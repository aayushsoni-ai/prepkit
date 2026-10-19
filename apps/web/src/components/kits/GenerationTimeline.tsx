"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";

interface StageInfo {
  id: string;
  label: string;
}

const STAGES: StageInfo[] = [
  { id: "validate_input", label: "Input Validation" },
  { id: "extract_requirements", label: "Extracting Hard Requirements" },
  { id: "crawl_company", label: "Safe Company Crawl & Intel" },
  { id: "find_hiring_process", label: "Detecting Hiring Process" },
  { id: "search_discussion", label: "Searching Developer Discussions" },
  { id: "build_brief", label: "Synthesizing Company Brief" },
  { id: "generate_questions", label: "Generating Question Bank & Answers" },
  { id: "generate_flashcards", label: "Synthesizing Flashcards" },
  { id: "assemble_kit", label: "Validating Invariants & Final Assembly" }
];

export function GenerationTimeline({ jobId, kitId }: { jobId: string; kitId: string }) {
  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [resuming, setResuming] = useState(false);
  const etagRef = useRef<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const poll = async () => {
      try {
        const res = await api.jobs.get(jobId, etagRef.current);
        if (!res.notModified && res.job) {
          setJob(res.job);
          etagRef.current = res.job.etag;

          if (res.job.status === "completed") {
            router.push(`/kits/${kitId}`);
            return;
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to poll job status");
      }

      timer = setTimeout(poll, 1200);
    };

    poll();
    return () => clearTimeout(timer);
  }, [jobId, kitId, router]);

  const handleResume = async () => {
    setResuming(true);
    try {
      await api.jobs.resume(jobId);
    } catch (err: any) {
      setError(err.message || "Failed to resume pipeline");
    } finally {
      setResuming(false);
    }
  };

  const currentStageIndex = job?.progress?.stage
    ? STAGES.findIndex((s) => s.id === job.progress.stage)
    : 0;

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-normal text-[var(--text)]">Building Your Kit</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">Job ID: {jobId}</p>
      </div>

      {job?.status === "failed" && (
        <div className="p-4 bg-[var(--accent-subtle)] border border-[var(--accent)]/40 rounded-lg flex flex-col gap-3">
          <p className="text-xs text-[var(--accent)] font-medium">
            Generation halted: {job?.error || "Pipeline error occurred"}
          </p>
          <Button variant="primary" size="sm" onClick={handleResume} loading={resuming}>
            Resume Pipeline
          </Button>
        </div>
      )}

      <div className="border border-[var(--border)] rounded-lg bg-[var(--card-bg)] divide-y divide-[var(--border)]">
        {STAGES.map((s, idx) => {
          const isDone = job?.status === "completed" || idx < currentStageIndex;
          const isCurrent = job?.status === "running" && idx === currentStageIndex;

          return (
            <div key={s.id} className="p-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[var(--text-muted)] w-5">
                  0{idx + 1}
                </span>
                <span className={isCurrent ? "font-semibold text-[var(--accent)]" : ""}>
                  {s.label}
                </span>
              </div>
              <div>
                {isDone ? (
                  <span className="text-xs font-mono text-[var(--accent)]">Done</span>
                ) : isCurrent ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-xs font-mono text-[var(--text-faint)]">Pending</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {job?.progress?.skipped_sources?.length > 0 && (
        <details className="text-xs text-[var(--text-muted)] border border-[var(--border)] p-3 rounded-md bg-[var(--subtle-bg)]/50">
          <summary className="cursor-pointer font-medium">
            Skipped sources ({job.progress.skipped_sources.length})
          </summary>
          <ul className="mt-2 space-y-1 font-mono text-[11px]">
            {job.progress.skipped_sources.map((s: any, i: number) => (
              <li key={i} className="truncate">
                {s.url} — <span className="text-[var(--text-faint)]">{s.reason}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
