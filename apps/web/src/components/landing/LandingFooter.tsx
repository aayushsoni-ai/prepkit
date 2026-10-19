import React from "react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="py-12 bg-[var(--bg)] border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/" className="font-serif text-xl text-[var(--text)]">
            prepkit<span className="text-[var(--accent)]">.</span>
          </Link>
          <span className="hidden sm:inline text-[var(--border-dark)]">&bull;</span>
          <span className="font-mono text-[11px]">
            Autonomous Interview Preparation Pipeline
          </span>
        </div>

        <div className="flex items-center space-x-6 font-mono text-[11px] uppercase tracking-wider">
          <a href="#features" className="hover:text-[var(--text)] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[var(--text)] transition-colors">Architecture</a>
          <a href="#faq" className="hover:text-[var(--text)] transition-colors">FAQ</a>
          <Link href="/login" className="hover:text-[var(--text)] transition-colors">Sign In</Link>
        </div>

        <div className="text-[11px] font-mono text-[var(--text-faint)]">
          &copy; {new Date().getFullYear()} Prepkit. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
