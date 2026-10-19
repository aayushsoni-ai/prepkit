"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/ui/Field";

export function CreateKitForm() {
  const [jd, setJd] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.jd) setJd(parsed.jd);
        if (parsed.company_url) setCompanyUrl(parsed.company_url);
        if (parsed.days) setDays(Number(parsed.days));
      } catch {
        setError("Invalid JSON format in uploaded file");
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.kits.create({ jd, company_url: companyUrl, days: Number(days) });
      if (res.existing || !res.jobId) {
        router.push(`/kits/${res.kitId}`);
      } else {
        router.push(`/kits/generating/${res.jobId}?kitId=${res.kitId}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create preparation kit");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl w-full">
      {error && (
        <div className="p-3 bg-[var(--accent-subtle)] border border-[var(--accent)]/30 rounded text-xs text-[var(--accent)] font-medium">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
        <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wide">
          Input Details
        </span>
        <label className="text-xs text-[var(--accent)] font-medium cursor-pointer hover:underline">
          <span>Import JSON</span>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      <Field
        label="Company Website URL"
        id="company_url"
        hint="We crawl official engineering & careers pages to ground questions in actual practice."
        required
      >
        <input
          id="company_url"
          type="url"
          required
          placeholder="https://example.com"
          className={inputClass}
          value={companyUrl}
          onChange={(e) => setCompanyUrl(e.target.value)}
        />
      </Field>

      <Field
        label="Job Description"
        id="jd"
        hint="Paste the complete job post, responsibilities, and requirements."
        required
      >
        <textarea
          id="jd"
          required
          rows={6}
          placeholder="Paste job description text here..."
          className={textareaClass}
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />
      </Field>

      <Field label="Preparation Timeline (Days)" id="days" required>
        <div className="flex items-center gap-3">
          <input
            id="days"
            type="number"
            min={1}
            max={60}
            required
            className={`${inputClass} w-24 font-mono`}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
          <div className="flex gap-2">
            {[3, 7, 14, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-xs font-mono rounded border cursor-pointer transition-colors ${
                  days === d
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)]"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </Field>

      <Button type="submit" loading={loading} size="lg" className="w-full mt-4">
        Generate Preparation Kit
      </Button>
    </form>
  );
}
