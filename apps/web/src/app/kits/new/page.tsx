"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SessionGate } from "@/components/layout/SessionGate";
import { CreateKitForm } from "@/components/kits/CreateKitForm";

export default function NewKitPage() {
  return (
    <SessionGate>
      <AppShell>
        <div className="max-w-2xl mx-auto py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-normal text-[var(--text)]">New Preparation Kit</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Input the job details below. Our pipeline will safely crawl company sources, extract requirements, and build your custom kit.
            </p>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-6 sm:p-8 shadow-xs">
            <CreateKitForm />
          </div>
        </div>
      </AppShell>
    </SessionGate>
  );
}
