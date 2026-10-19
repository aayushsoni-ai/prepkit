"use client";

import React, { createContext, useContext, useState } from "react";
import { api } from "@/lib/api/client";

interface KitContextType {
  kit: any;
  version: number;
  saving: boolean;
  error: string | null;
  patchQuestion: (qId: string, updates: Record<string, unknown>) => Promise<void>;
  addQuestion: (category: string, question: string, guidance: string, difficulty: number) => Promise<void>;
  deleteQuestion: (qId: string) => Promise<void>;
  reorderQuestion: (activeId: string, overId: string, targetCategory?: string) => Promise<void>;
  regenerate: (section?: string, category?: string) => Promise<void>;
  undo: () => Promise<void>;
}

const KitContext = createContext<KitContextType | undefined>(undefined);

export function KitProvider({ initialKit, initialVersion, children }: { initialKit: any; initialVersion: number; children: React.ReactNode }) {
  const [kit, setKit] = useState(initialKit);
  const [version, setVersion] = useState(initialVersion);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patchQuestion = async (qId: string, updates: Record<string, unknown>) => {
    setKit((prev: any) => ({
      ...prev,
      questions: prev.questions.map((q: any) => (q.id === qId ? { ...q, ...updates, edited: true } : q))
    }));

    setSaving(true);
    try {
      await api.kits.patchQuestion(kit.id, qId, updates, version);
      setVersion((v) => v + 1);
    } catch (err: any) {
      setError(err.message || "Failed to save question edit");
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = async (category: string, question: string, guidance: string, difficulty: number) => {
    setSaving(true);
    try {
      await api.kits.addQuestion(kit.id, { category, question, guidance, difficulty, expectedVersion: version });
      const res = await api.kits.get(kit.id);
      setKit(res.kit);
      setVersion(res.version);
    } catch (err: any) {
      setError(err.message || "Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (qId: string) => {
    setKit((prev: any) => ({
      ...prev,
      questions: prev.questions.filter((q: any) => q.id !== qId)
    }));

    setSaving(true);
    try {
      await api.kits.deleteQuestion(kit.id, qId, version);
      setVersion((v) => v + 1);
    } catch (err: any) {
      setError(err.message || "Failed to delete question");
    } finally {
      setSaving(false);
    }
  };

  const reorderQuestion = async (activeId: string, overId: string, targetCategory?: string) => {
    setKit((prev: any) => {
      const qs = [...prev.questions];
      const activeIdx = qs.findIndex((q) => q.id === activeId);
      const overIdx = qs.findIndex((q) => q.id === overId);
      if (activeIdx === -1 || overIdx === -1) return prev;

      const [moved] = qs.splice(activeIdx, 1);
      if (targetCategory) moved.category = targetCategory;
      qs.splice(overIdx, 0, moved);

      return { ...prev, questions: qs };
    });
  };

  const regenerate = async (section?: string, category?: string) => {
    setSaving(true);
    try {
      const res = await api.kits.regenerate(kit.id, { section, category, expectedVersion: version });
      setKit(res.kit);
      setVersion(res.version);
    } catch (err: any) {
      setError(err.message || "Regeneration failed");
    } finally {
      setSaving(false);
    }
  };

  const undo = async () => {
    setSaving(true);
    try {
      const res = await api.kits.undo(kit.id);
      setKit(res.kit);
      setVersion(res.version);
    } catch (err: any) {
      setError(err.message || "Undo failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KitContext.Provider value={{ kit, version, saving, error, patchQuestion, addQuestion, deleteQuestion, reorderQuestion, regenerate, undo }}>
      {children}
    </KitContext.Provider>
  );
}

export function useKit() {
  const ctx = useContext(KitContext);
  if (!ctx) throw new Error("useKit must be used within KitProvider");
  return ctx;
}
