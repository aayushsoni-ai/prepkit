"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.auth.register({ email, password });
      router.push("/kits");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
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
          <h1 className="text-xl font-serif text-[var(--text)] mt-3">Get started</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Create your Prepkit account</p>
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

          <Field
            label="Password"
            id="password"
            hint="Minimum 8 characters"
            required
          >
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--accent)] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
