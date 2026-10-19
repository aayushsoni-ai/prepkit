"use client";

import React, { useEffect, useRef, useState } from "react";

export function InlineText({
  value,
  onSave,
  multiline = false,
  className = "",
  placeholder = "Click to edit..."
}: {
  value: string;
  onSave: (val: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleBlur = () => {
    setEditing(false);
    if (text !== value && text.trim().length > 0) {
      onSave(text.trim());
    } else {
      setText(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      handleBlur();
    } else if (e.key === "Escape") {
      setText(value);
      setEditing(false);
    }
  };

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className={`cursor-pointer hover:bg-[var(--subtle-bg)]/60 rounded px-1 -mx-1 transition-colors ${className}`}
        title="Click to edit"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setEditing(true);
          }
        }}
      >
        {text || <span className="text-[var(--text-faint)] italic">{placeholder}</span>}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={text}
        rows={3}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full text-xs p-1 bg-[var(--card-bg)] text-[var(--text)] border border-[var(--accent)] rounded focus:outline-none"
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-full text-sm font-medium p-1 bg-[var(--card-bg)] text-[var(--text)] border border-[var(--accent)] rounded focus:outline-none"
    />
  );
}
