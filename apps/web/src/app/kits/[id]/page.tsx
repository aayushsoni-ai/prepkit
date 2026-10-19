"use client";

import React, { use, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { AppShell } from "@/components/layout/AppShell";
import { SessionGate } from "@/components/layout/SessionGate";
import { KitProvider } from "@/context/KitProvider";
import { Tabs } from "@/components/ui/Tabs";
import { QuestionBoard } from "@/components/builder/QuestionBoard";
import { BriefPanel } from "@/components/views/BriefPanel";
import { ScheduleView } from "@/components/views/ScheduleView";
import { PracticeSession } from "@/components/views/PracticeSession";
import { WeakSpotsReport } from "@/components/views/WeakSpotsReport";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

export default function KitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<{ kit: any; version: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("questions");
  const [drillReqIds, setDrillReqIds] = useState<string[] | undefined>(undefined);

  const loadKit = () => {
    setLoading(true);
    api.kits
      .get(resolvedParams.id)
      .then((res: any) => setData(res))
      .catch((err: any) => setError(err.message || "Failed to load kit"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadKit();
  }, [resolvedParams.id]);

  const handleStartDrill = (reqIds: string[]) => {
    setDrillReqIds(reqIds);
    setActiveTab("practice");
  };

  if (loading) {
    return (
      <SessionGate>
        <AppShell>
          <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-96 w-full" />
          </div>
        </AppShell>
      </SessionGate>
    );
  }

  if (error || !data) {
    return (
      <SessionGate>
        <AppShell>
          <ErrorState message={error || "Kit not found"} onRetry={loadKit} />
        </AppShell>
      </SessionGate>
    );
  }

  const { kit, version } = data;
  const tabs = [
    { id: "questions", label: "Question Board", badge: kit.questions?.length },
    { id: "brief", label: "Company & Role Brief" },
    { id: "schedule", label: "Schedule", badge: `${kit.schedule?.days || 0}d` },
    { id: "practice", label: "Flashcards", badge: kit.flashcards?.length },
    { id: "weakspots", label: "Weak Spots" }
  ];

  return (
    <SessionGate>
      <AppShell>
        <KitProvider initialKit={kit} initialVersion={version}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-wide">
                  {kit.brief?.company || "Company"}
                </span>
                <h1 className="font-serif text-3xl font-normal text-[var(--text)] mt-1">
                  {kit.brief?.role || "Interview Preparation Kit"}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--subtle-bg)] px-2 py-1 rounded border border-[var(--border)]">
                  v{version}
                </span>
              </div>
            </div>

            <Tabs tabs={tabs} activeId={activeTab} onChange={(t) => {
              setActiveTab(t);
              if (t !== "practice") setDrillReqIds(undefined);
            }} />

            <div className="mt-2">
              {activeTab === "questions" && <QuestionBoard />}
              {activeTab === "brief" && <BriefPanel />}
              {activeTab === "schedule" && <ScheduleView />}
              {activeTab === "practice" && <PracticeSession filterReqIds={drillReqIds} />}
              {activeTab === "weakspots" && <WeakSpotsReport onStartDrill={handleStartDrill} />}
            </div>
          </div>
        </KitProvider>
      </AppShell>
    </SessionGate>
  );
}
