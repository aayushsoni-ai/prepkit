import React from "react";
import Link from "next/link";

export function CtaSection({ user }: { user: { id: string; email: string } | null }) {
  return (
    <section className="py-20 sm:py-28 bg-[var(--subtle-bg)]/40 border-b border-[var(--border)] text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent)] block mb-3">
          Get Started Today
        </span>
        <h2 className="font-serif text-4xl sm:text-6xl font-normal text-[var(--text)] tracking-tight mb-6 max-w-2xl mx-auto leading-tight">
          Turn any job description into an unfair advantage.
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl mx-auto mb-8 leading-relaxed">
          Grounded company intelligence, structured question banks, and active recall practice — tailored to your exact interview timeline.
        </p>
        <Link
          href={user ? "/kits/new" : "/register"}
          className="inline-block px-8 py-3.5 rounded bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm text-sm"
        >
          {user ? "Create New Kit" : "Create Your First Kit"}
        </Link>
      </div>
    </section>
  );
}
