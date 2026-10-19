"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { AppShell } from "@/components/layout/AppShell";
import { SessionGate } from "@/components/layout/SessionGate";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

interface KitSummary {
  id: string;
  brief: { company: string; role: string };
  schedule: { days: number };
  questions: unknown[];
  flashcards: unknown[];
}

export default function KitsPage() {
  const [kits, setKits] = useState<KitSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.kits
      .list()
      .then((res: any) => {
        setKits(res.kits || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SessionGate>
      <AppShell>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-normal text-[var(--text)]">Your Kits</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Interview preparation workspaces tailored to your target roles.
              </p>
            </div>
            <Link href="/kits/new">
              <Button variant="primary">+ New Kit</Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ) : kits.length === 0 ? (
            <EmptyState
              title="No interview kits yet"
              description="Paste a job description and company URL to generate your first kit in minutes."
              action={{
                label: "Generate Kit",
                onClick: () => (window.location.href = "/kits/new")
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kits.map((kit) => (
                <Link
                  key={kit.id}
                  href={`/kits/${kit.id}`}
                  className="group block p-6 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--accent)] transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-wide">
                      {kit.brief?.company || "Company"}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      {kit.schedule?.days || 0}d prep
                    </span>
                  </div>
                  <h2 className="font-serif text-xl font-normal text-[var(--text)] group-hover:text-[var(--accent)] transition-colors mb-2">
                    {kit.brief?.role || "Interview Kit"}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] pt-4 border-t border-[var(--border)]">
                    <span>{kit.questions?.length || 0} questions</span>
                    <span>{kit.flashcards?.length || 0} flashcards</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </SessionGate>
  );
}
