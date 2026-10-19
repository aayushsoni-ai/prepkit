"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "./SessionGate";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useUser();
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg)]/90 sticky top-0 z-30 backdrop-blur-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href={user ? "/kits" : "/"} className="font-serif text-2xl tracking-tight text-[var(--text)] hover:text-[var(--accent)] transition-colors">
              prepkit<span className="text-[var(--accent)]">.</span>
            </Link>
            <nav className="hidden sm:flex space-x-6 text-sm font-medium">
              <Link
                href="/kits"
                className={`transition-colors pb-1 ${
                  pathname.startsWith("/kits")
                    ? "text-[var(--accent)] font-semibold border-b-2 border-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                My Kits
              </Link>
              <Link
                href="/kits/new"
                className={`transition-colors pb-1 ${
                  pathname === "/kits/new"
                    ? "text-[var(--accent)] font-semibold border-b-2 border-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                + New Kit
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs text-[var(--text-muted)] font-mono hidden md:inline-block">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
