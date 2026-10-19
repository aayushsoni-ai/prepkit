"use client";

import React, { useState } from "react";

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Prepkit discover company hiring processes without hardcoded paths?",
      a: "Prepkit starts at the company homepage, fetches robots.txt, parses sitemaps, and extracts candidate links. It ranks URLs based on hiring and engineering keywords, follows relative links (e.g. into deep engineering handbooks), and extracts clean copy with Mozilla Readability."
    },
    {
      q: "What happens if a job description is a brief two-line stub?",
      a: "Prepkit never invents qualifications that aren't present. A thin posting produces an honest, minimal kit with explicit warnings, rather than hallucinated competencies."
    },
    {
      q: "Will regenerating a category erase questions I edited or wrote by hand?",
      a: "No. Prepkit models item state across origin (generated vs user), edited (boolean), and pinned (boolean). When regenerating, user-added, edited, and pinned questions are preserved. You also have an instant Undo action."
    },
    {
      q: "How does the Weak Spots report help prepare for interviews?",
      a: "As you review flashcards, your 1-to-5 recall ratings feed our SM-2 algorithm. The Weak Spots report identifies competencies with sub-60% mastery scores and provides a one-click targeted drill session for those specific requirements."
    },
    {
      q: "How does Prepkit handle LLM provider rate limits and transient errors?",
      a: "The API implements a dual token-bucket limiter for requests per minute (RPM) and tokens per minute (TPM), respects Retry-After headers, uses exponential backoff jitter, and automatically repairs malformed JSON responses."
    }
  ];

  return (
    <section id="faq" className="py-20 sm:py-24 border-b border-[var(--border)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent)] block mb-2">
            Frequently Asked Questions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--text)] tracking-tight">
            Everything you need to know about Prepkit
          </h2>
        </div>

        <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="py-5">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between text-left font-serif text-lg text-[var(--text)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="font-mono text-xs text-[var(--text-muted)] ml-4 shrink-0">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs text-[var(--text-muted)] leading-relaxed max-w-2xl">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
