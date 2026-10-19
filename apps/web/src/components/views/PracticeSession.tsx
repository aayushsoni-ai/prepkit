"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { useKit } from "@/context/KitProvider";
import { Button } from "@/components/ui/Button";

export function PracticeSession({ filterReqIds }: { filterReqIds?: string[] }) {
  const { kit } = useKit();
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const flashcards = kit.flashcards || [];
    if (filterReqIds && filterReqIds.length > 0) {
      setCards(flashcards.filter((c: any) => filterReqIds.includes(c.requirement_id)));
    } else {
      setCards(flashcards);
    }
    setLoading(false);
  }, [kit, filterReqIds]);

  const handleRate = async (confidence: number) => {
    const card = cards[currentIndex];
    if (!card) return;

    setSubmitting(true);
    try {
      await api.practice.rate(card.id, confidence);
      setFlipped(false);
      setCurrentIndex((i) => i + 1);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs font-mono">Loading flashcards...</div>;
  }

  if (cards.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[var(--border)] rounded-lg">
        <p className="text-sm text-[var(--text-muted)]">No flashcards available in this drill.</p>
      </div>
    );
  }

  if (currentIndex >= cards.length) {
    return (
      <div className="max-w-md mx-auto text-center p-8 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
        <h3 className="font-serif text-2xl mb-2">Drill Complete</h3>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          You reviewed all {cards.length} cards in this set. Your ratings update your spaced repetition mastery scores.
        </p>
        <Button
          variant="primary"
          onClick={() => {
            setCurrentIndex(0);
            setFlipped(false);
          }}
        >
          Review Again
        </Button>
      </div>
    );
  }

  const current = cards[currentIndex];

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <span className="uppercase text-[var(--accent)]">{current.category}</span>
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="min-h-[260px] p-8 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-sm flex flex-col justify-between cursor-pointer hover:border-[var(--border-dark)] transition-all select-none"
      >
        <div>
          <span className="text-[10px] font-mono uppercase text-[var(--text-faint)] block mb-3">
            {flipped ? "Answer & Key Points" : "Question Prompt"}
          </span>
          <p className="font-serif text-xl text-[var(--text)] leading-snug">
            {flipped ? current.back : current.front}
          </p>
        </div>
        <div className="pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--text-faint)]">
          {flipped ? "Select your confidence below" : "Click to flip card"}
        </div>
      </div>

      {flipped && (
        <div className="flex flex-col gap-2 animate-fade-in">
          <span className="text-center text-xs text-[var(--text-muted)]">Rate your recall:</span>
          <div className="grid grid-cols-5 gap-2">
            {[
              { score: 1, label: "Again" },
              { score: 2, label: "Hard" },
              { score: 3, label: "Good" },
              { score: 4, label: "Easy" },
              { score: 5, label: "Perfect" }
            ].map((btn) => (
              <button
                key={btn.score}
                disabled={submitting}
                onClick={() => handleRate(btn.score)}
                className="py-2.5 px-2 bg-[var(--card-bg)] border border-[var(--border)] rounded text-xs font-medium hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer disabled:opacity-50 text-center"
              >
                <span className="block font-mono text-[10px] text-[var(--text-faint)]">{btn.score}</span>
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
