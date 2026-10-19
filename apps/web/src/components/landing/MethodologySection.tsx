import React from "react";

export function MethodologySection() {
  const steps = [
    {
      step: "01",
      title: "Input & Safe Retrieval",
      body: "Paste your target job description and company URL. Our crawler enforces strict DNS pinning and SSRF protection, discovering engineering handbook paths without hardcoded guesses."
    },
    {
      step: "02",
      title: "9-Stage Pipeline & Gap Closure",
      body: "The pipeline extracts hard requirements, crawls company discussions, categorizes questions separately, and runs a mathematical coverage check to eliminate uncovered requirements."
    },
    {
      step: "03",
      title: "Reshape, Practice & Retain",
      body: "Adjust questions on the interactive board, regenerate individual sections without clobbering your edits, and drill flashcards with SM-2 spaced repetition tracking."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-24 border-b border-[var(--border)] bg-[var(--subtle-bg)]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent)] block mb-2">
            Deterministic Architecture
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[var(--text)] tracking-tight">
            How Prepkit turns unstructured postings into rigorous interview kits.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((s) => (
            <div key={s.step} className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-xs">
              <span className="font-mono text-2xl font-light text-[var(--accent)] block mb-3">
                {s.step}
              </span>
              <h3 className="font-serif text-xl font-normal text-[var(--text)] mb-2">
                {s.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        <div id="methodology" className="p-8 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
          <div className="max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent)] block mb-2">
              Engineering Principles
            </span>
            <h3 className="font-serif text-2xl font-normal text-[var(--text)] mb-3">
              What we refuse to let the model decide
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
              LLMs excel at linguistic synthesis, but fail at exact arithmetic and safety invariants. Prepkit keeps the model inside strict deterministic boundaries:
            </p>
            <ul className="space-y-2 text-xs text-[var(--text)]">
              <li className="flex items-start gap-2">
                <span className="font-mono text-[var(--accent)] font-bold">&bull;</span>
                <span><strong>Schedule Arithmetic:</strong> Days and duration minutes are computed in TypeScript algorithms, never by the LLM.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-[var(--accent)] font-bold">&bull;</span>
                <span><strong>Coverage Verification:</strong> Coverage is checked via code set-differences, guaranteeing every must-have requirement has a question.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-[var(--accent)] font-bold">&bull;</span>
                <span><strong>Security Boundaries:</strong> Untrusted web content is wrapped in cryptographic nonces to neutralize prompt injection attacks.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
