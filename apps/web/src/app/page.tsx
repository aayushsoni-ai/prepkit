import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl tracking-tight text-[var(--text)]">
            prepkit<span className="text-[var(--accent)]">.</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium px-4 py-2 rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-20 sm:py-28 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-xs font-mono text-[var(--text-muted)] mb-8">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] inline-block" />
          Autonomous Interview Intelligence
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl font-normal tracking-tight text-[var(--text)] leading-[1.08] max-w-3xl mb-6">
          Interview preparation grounded in truth, not generic templates.
        </h1>

        <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl mb-10 leading-relaxed">
          Prepkit retrieves actual hiring processes, extracts hard requirements from job descriptions, and synthesizes tailored question banks, schedules, and flashcard drills.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/kits/new"
            className="w-full sm:w-auto px-8 py-3.5 rounded-md bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm text-sm"
          >
            Create your first kit
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-md border border-[var(--border-dark)] bg-[var(--card-bg)] text-[var(--text)] font-medium hover:bg-[var(--subtle-bg)] transition-all text-sm"
          >
            View dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24 text-left w-full border-t border-[var(--border)] pt-12">
          <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
            <span className="font-mono text-xs text-[var(--accent)] block mb-2">01 / RETRIEVAL</span>
            <h3 className="font-serif text-lg mb-1">Company Grounding</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Crawls company engineering blogs and interviews to extract authentic team culture and evaluation stages.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
            <span className="font-mono text-xs text-[var(--accent)] block mb-2">02 / STRUCTURE</span>
            <h3 className="font-serif text-lg mb-1">Gap-Free Coverage</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Maps every single requirement across technical, architectural, behavioral, and culture categories.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
            <span className="font-mono text-xs text-[var(--accent)] block mb-2">03 / MASTERY</span>
            <h3 className="font-serif text-lg mb-1">Spaced Practice</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Interactive flashcards with SM-2 spaced repetition algorithms track weak spots and guide daily preparation.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
