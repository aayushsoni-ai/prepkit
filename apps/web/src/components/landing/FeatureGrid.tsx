import React from "react";

export function FeatureGrid() {
  const features = [
    {
      num: "01",
      tag: "REAL INTEL",
      title: "Autonomous Company Intelligence",
      description: "Crawls public engineering handbooks, blogs, and developer forums (Hacker News) to detect authentic evaluation stages and team architecture norms."
    },
    {
      num: "02",
      tag: "GROUNDING",
      title: "Hard Requirement Extraction",
      description: "Linguistically classifies requirements into must vs nice. No hallucinated qualifications. Thin postings generate honest, concise kits."
    },
    {
      num: "03",
      tag: "GAP-FREE",
      title: "Two-Pass Coverage Engine",
      description: "Code checks every single requirement against generated questions. Any detected gap triggers an autonomous second pass to guarantee complete preparation."
    },
    {
      num: "04",
      tag: "FLEXIBLE",
      title: "Interactive Builder with Pinning",
      description: "Edit questions inline, reorder categories via drag-and-drop, add custom items, and pin questions so they survive category regeneration."
    },
    {
      num: "05",
      tag: "ARITHMETIC",
      title: "Exact Day Schedule Allocation",
      description: "Distributes topics across exactly the number of days you have (1 to 60). Tougher and high-priority concepts are allocated early, not the night before."
    },
    {
      num: "06",
      tag: "RETENTION",
      title: "Spaced Repetition & Weak Spots",
      description: "SM-2 flashcard recall drills calculate competency readiness and offer targeted single-click sessions focused strictly on your weak areas."
    }
  ];

  return (
    <section id="features" className="py-20 sm:py-24 border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent)] block mb-2">
            Engineered Capabilities
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[var(--text)] tracking-tight">
            Built for engineering candidates who need substance, not generic templates.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.num}
              className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:border-[var(--border-dark)] transition-all flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-[var(--accent)] font-semibold">
                    {f.num} / {f.tag}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-normal text-[var(--text)] mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
