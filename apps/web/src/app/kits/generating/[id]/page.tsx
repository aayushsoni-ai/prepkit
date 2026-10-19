"use client";

import React, { use } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SessionGate } from "@/components/layout/SessionGate";
import { GenerationTimeline } from "@/components/kits/GenerationTimeline";

export default function GeneratingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const kitId = searchParams.get("kitId") || resolvedParams.id;

  return (
    <SessionGate>
      <AppShell>
        <div className="py-12">
          <GenerationTimeline jobId={resolvedParams.id} kitId={kitId} />
        </div>
      </AppShell>
    </SessionGate>
  );
}
