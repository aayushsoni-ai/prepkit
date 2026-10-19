import React from "react";

export interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  id?: string;
}

export function Field({ label, error, hint, required, children, id }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-sm font-medium text-[var(--text)] flex items-center gap-1">
        {label}
        {required && <span className="text-[var(--accent)]">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      {error && <p className="text-xs text-[var(--accent)] font-medium">{error}</p>}
    </div>
  );
}

export const inputClass =
  "w-full px-3 py-2 text-sm bg-[var(--card-bg)] text-[var(--text)] border border-[var(--border)] rounded-md transition-colors placeholder:text-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] disabled:bg-[var(--subtle-bg)] disabled:opacity-60";

export const textareaClass =
  "w-full px-3 py-2 text-sm bg-[var(--card-bg)] text-[var(--text)] border border-[var(--border)] rounded-md transition-colors placeholder:text-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] disabled:bg-[var(--subtle-bg)] disabled:opacity-60 resize-y";
