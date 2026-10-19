# Prepkit — The AI Interview Prep Kit

Prepkit transforms an unstructured job description and company website URL into an authentic, grounded interview preparation kit: a company brief, a role breakdown, a structured question bank, flashcards, and a day-by-day study schedule. 

Built with a staged pipeline that investigates company engineering culture first, generates tailored question categories separately, mathematically validates requirement coverage, and closes gaps on a second pass. Every element can be edited, reordered, pinned, regenerated with undo, and drilled via spaced repetition.

---

## 1. Stack & Rationale

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router) + Tailwind CSS v4 | Required stack. Accessible, performant server and client component boundaries with responsive layout. |
| **Backend** | Node.js + Express, TypeScript | Required stack. Strict schema enforcement and clean separation of concerns. |
| **Database** | MongoDB (Atlas M0) | Kits are single nested documents read and written transactionally with versioning. |
| **Validation** | Zod | Single source of truth driving HTTP request parsing, LLM output schemas, and domain invariants. |
| **LLM Provider** | Groq (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) with Gemini fallback | High-throughput, sub-second generation on free tiers with fallback protection. |
| **Retrieval** | `undici` + `cheerio` + `@mozilla/readability` | Headless-free, memory-efficient crawling compliant with `robots.txt` and SSRF protection. |
| **Tests** | Vitest | Fast native TypeScript test runner (63 unit & integration tests). |

---

## 2. High-Level Architecture

Prepkit is organized as an npm workspace monorepo:
- `apps/api`: REST API, domain invariants, staged pipeline, crawler, LLM client, and batch CLI.
- `apps/web`: Next.js web application, question board builder, practice views, and landing page.

```
[User Input] ──────────────────────────┐
  (JD, URL, Days)                      │
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          9-Stage Pipeline                              │
│  1. validateInput       ──> Fast sanity check                          │
│  2. extractRequirements ──> Linguistic tagging (must vs nice)          │
│  3. crawlCompany        ──> Robots.txt, ranked links, Readability      │
│  4. findHiringProcess   ──> Discovers interview rounds                 │
│  5. searchDiscussion    ──> Hacker News & Brave dev impressions        │
│  6. buildBrief          ──> Company intel & engineering culture        │
│  7. generateQuestions   ──> Categorized question generation            │
│  8. generateFlashcards  ──> Active recall synthesis                    │
│  9. assembleKit         ──> Coverage check & deterministic fallbacks   │
└────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────┐
│ The Builder      │ <─────> │ Practice Mode    │ <─────> │ Persistence  │
│ (DnD & Pinning)  │         │ (SM-2 Flashcard) │         │ (MongoDB)    │
└──────────────────┘         └──────────────────┘         └──────────────┘
```

---

## 3. Retrieval Approach & Sources Used

Finding interview stages cannot rely on hardcoded paths like `/careers`. Companies bury process details in handbooks, blog posts, or deep engineering documents.
1. **Polite Crawler:** Reads `robots.txt`, parses sitemaps, and crawls starting from the target URL.
2. **Link Ranker:** Analyzes candidate links using keyword heuristics (`careers`, `jobs`, `handbook`, `culture`, `interview`, `engineering`), resolving relative paths (`../../ops/people/...`).
3. **Article Cleaner:** Extracts readable article body copy using Mozilla Readability and strips scripts/styles.
4. **Community Discussions:** Queries Hacker News Algolia API and Brave Search for public developer interviews and interview feedback.
5. **SSRF Guard:** Validates URLs, rejects loopback and private IPv4/IPv6 CIDRs, and pins resolved DNS IPs to prevent DNS rebinding attacks.

---

## 4. Staged Sequencing & What the Model Never Decides

The pipeline executes in deliberate, sequential stages rather than a single monolithic prompt:
- Pasted job descriptions are processed immediately without unnecessary network calls.
- Company crawling completes before questions are generated so discovered interview formats (e.g., take-home vs live system design) directly shape question categories.
- Requirements like *"5+ years React"* lead to technical questions, while *"Mentoring junior engineers"* produces behavioral questions — generated via separate targeted prompts.

### What We Refuse to Let the Model Decide
1. **Schedule Arithmetic:** Allocating questions across available days is arithmetic. Our TypeScript code partitions days and calculates integer minute durations.
2. **Coverage Verification:** Checking whether all `must` requirements have questions is performed via code set-differences.
3. **Security Invariants:** Prompt injection defense wraps untrusted text in cryptographic nonces so web copy cannot hijack instructions.

---

## 5. The Second Pass & Gap Closure

After initial generation, the system mathematically inspects coverage:
1. **Pass 1:** Questions are mapped to requirement IDs.
2. **Gap Detection:** The system compares `must` requirements against covered IDs in code.
3. **Pass 2:** If any must-have requirement lacks a question, a targeted second pass generates questions specifically for the missing IDs.
4. **Deterministic Fallback:** If the model still misses, grounded fallback questions are injected, guaranteeing that no kit ships with uncovered must-have requirements.

---

## 6. The Builder: State Representation & Preservation

Managing user edits alongside autonomous regeneration is handled through three explicit states per item:
- `origin`: `"generated"` | `"user"`
- `edited`: `boolean` (set to `true` when a user modifies question text or guidance)
- `pinned`: `boolean` (set when a user pins a question)

### Regeneration Algorithm
When a user regenerates a category:
1. All `user`, `edited`, and `pinned` items are partitioned and protected.
2. Only unedited, unpinned items are refreshed.
3. The previous state is saved to an undo snapshot stack, enabling instant one-click restoration.

---

## 7. Arithmetic Schedule Allocation

The user specifies their available timeline (1 to 60 days):
- Every day receives a focus theme, a list of question IDs, and an integer duration in minutes.
- Higher-priority (`must`) and harder (difficulty 3) topics are front-loaded into earlier days.
- The final days focus on synthesis, review, and company alignment, ensuring candidates are never cramming difficult material the night before.

---

## 8. Practice Mode & Creative Feature (Weak Spots Report)

- **Active Recall Flashcards:** 3D flip cards present prompt questions and reveal answer outlines.
- **5-Point SM-2 Rating:** Users rate recall confidence (`1: Again`, `2: Hard`, `3: Good`, `4: Easy`, `5: Perfect`), updating retention intervals and tracking decay.
- **Creative Feature — Weak Spots Report:** Analyzes historical practice scores across all competencies. Competencies with sub-60% mastery are highlighted with a **"Drill Weak Spots"** button that immediately loads a practice queue filtered to those vulnerable requirements.

---

## 9. Setup & Running Instructions

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/aayushsoni-ai/prepkit.git
   cd prepkit
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Add your `GROQ_API_KEY` and `MONGODB_URI`.

3. **Run both services:**
   ```bash
   npm run dev
   ```
   - Web Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:4000`

4. **Run automated test suite:**
   ```bash
   npm test
   ```

5. **Run the batch evaluation CLI (Section 9):**
   ```bash
   npm run evaluate -- --input apps/api/fixtures/cases.sample.json --output kits.json
   ```

---

## 10. Edge Cases & Resilience

- **404s & Timeouts:** Recorded in `skipped_sources` and reported honestly in the kit without crashing the run.
- **Two-Line JDs:** Generates an honest, concise kit with warnings rather than fabricating qualifications.
- **Rate Limits:** Handled via a dual token-bucket rate limiter with automatic exponential backoff and jitter.
- **Duplicate Submissions:** Computes an SHA-256 fingerprint (`userId + jd + url`) to return existing kits immediately.
- **Malformed LLM Output:** Tolerant JSON repair parses trailing commas, missing brackets, or re-prompts with a targeted repair schema.
