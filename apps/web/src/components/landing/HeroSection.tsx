import React from "react";
import Link from "next/link";

export function HeroSection({ user }: { user: { id: string; email: string } | null }) {
  return (
    <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-xs font-mono text-[var(--text-muted)] mb-8 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] inline-block" />
          Autonomous Pipeline &bull; Zero Hallucinated Fluff
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-[var(--text)] leading-[1.05] max-w-4xl mb-6">
          Interviews are won in the details. Grounded prep, zero fluff.
        </h1>

        <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl mb-10 leading-relaxed">
          Paste any job description and company URL. Prepkit safely crawls official engineering sources, uncovers genuine hiring stages, and produces a structured, fully reshapeable preparation workspace.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md mb-16">
          <Link
            href={user ? "/kits/new" : "/register"}
            className="w-full sm:w-auto px-8 py-3.5 rounded bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm text-sm text-center"
          >
            {user ? "Generate New Kit" : "Start Preparing for Free"}
          </Link>
          <Link
            href={user ? "/kits" : "/login"}
            className="w-full sm:w-auto px-8 py-3.5 rounded border border-[var(--border-dark)] bg-[var(--card-bg)] text-[var(--text)] font-medium hover:bg-[var(--subtle-bg)] transition-all text-sm text-center"
          >
            {user ? "Open Your Kits" : "Sign In to Workspace"}
          </Link>
        </div>

        <div className="w-full max-w-4xl bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-5 sm:p-6 shadow-sm text-left">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-5">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
              <span className="font-mono text-xs text-[var(--text)] font-semibold">
                SAMPLE OUTPUT &bull; STRIPE INFRASTRUCTURE ENGINEER
              </span>
            </div>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              7-Day Allocation &bull; v2.0
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded border border-[var(--border)] bg-[var(--subtle-bg)]/40">
              <span className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-wider block mb-1">
                Discovered Evaluation
              </span>
              <h4 className="font-serif text-sm text-[var(--text)] mb-1">Authentic Stages</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Technical Screen &rarr; Practical Systems Debugging &rarr; Distributed Scaling Architecture.
              </p>
            </div>

            <div className="p-3.5 rounded border border-[var(--border)] bg-[var(--subtle-bg)]/40">
              <span className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-wider block mb-1">
                Mapped Question
              </span>
              <h4 className="font-serif text-sm text-[var(--text)] mb-1">Raft Partition Handling</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Directly mapped to requirement: <em>5+ years Go &amp; Consensus Systems</em>.
              </p>
            </div>

            <div className="p-3.5 rounded border border-[var(--border)] bg-[var(--subtle-bg)]/40">
              <span className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-wider block mb-1">
                Active Recall Drill
              </span>
              <h4 className="font-serif text-sm text-[var(--text)] mb-1">Spaced SM-2 Cards</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Flashcards track retention intervals and auto-isolate weak spots before the interview.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
