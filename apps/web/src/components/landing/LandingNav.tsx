"use client";

import React from "react";
import Link from "next/link";

export function LandingNav({
  user,
  onLogout
}: {
  user: { id: string; email: string } | null;
  onLogout: () => void;
}) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg)]/90 sticky top-0 z-40 backdrop-blur-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link
            href={user ? "/kits" : "/"}
            className="font-serif text-2xl tracking-tight text-[var(--text)] hover:text-[var(--accent)] transition-colors"
          >
            prepkit<span className="text-[var(--accent)]">.</span>
          </Link>
          <nav className="hidden md:flex space-x-6 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
            <a href="#features" className="hover:text-[var(--text)] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[var(--text)] transition-colors">How It Works</a>
            <a href="#methodology" className="hover:text-[var(--text)] transition-colors">Methodology</a>
            <a href="#faq" className="hover:text-[var(--text)] transition-colors">FAQ</a>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                href="/kits"
                className="text-sm font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors"
              >
                My Kits
              </Link>
              <span className="text-xs text-[var(--text-muted)] font-mono hidden sm:inline">
                {user.email}
              </span>
              <button
                onClick={onLogout}
                className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors px-2 py-1"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-xs font-mono uppercase tracking-wider px-3.5 py-2 rounded bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors shadow-xs"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
