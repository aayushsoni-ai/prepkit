"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api.auth.me().then(() => router.replace("/kits")).catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.auth.login({ email, password });
      router.push("/kits");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
      <div className="max-w-md w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="font-serif text-3xl tracking-tight text-[var(--text)]">
            prepkit<span className="text-[var(--accent)]">.</span>
          </Link>
          <h1 className="text-xl font-serif text-[var(--text)] mt-3">Welcome back</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[var(--accent-subtle)] border border-[var(--accent)]/30 rounded text-xs text-[var(--accent)] font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email" id="email" required>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Password" id="password" required>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[var(--accent)] font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
