# Agent Brief: build Prepkit

Read README.md first. It is the design. This file is the order of work and the rules.

## Working rules

1. Build one phase at a time. At the end of a phase run the tests, fix failures, commit, then stop and report. Do not start the next phase until told.
2. No comments anywhere in the code. No JSDoc, no banner headers, no TODO markers, no commented out code. Names must carry the meaning.
3. Small files, small functions, one responsibility each. Prefer early returns over nesting. No file over about 150 lines.
4. No console.log in committed code except the batch command's final summary line.
5. TypeScript strict mode. No any. Types flow from zod schemas with z.infer.
6. Every external boundary validates with zod: requests, model output, fetched data.
7. Commits are small and in conventional form, for example feat(domain): allocate schedule across learn and review days. Commit after each meaningful unit, not once per phase.
8. Never let the model decide: schedule, coverage, ids, priority overrides, URL safety. These are code.
9. Never invent data. If research finds nothing, the output says so.
10. Visual rules: no blue, no purple, no gradients, no glow, no glass, no emoji, no stock illustrations. Warm paper and ink neutrals with a single terracotta accent. Hairline borders, 2 to 4 px radius, no drop shadows. Generous whitespace.
11. Motion rules: framer-motion, spring or short ease out, 150 to 400 ms. Every animation respects prefers-reduced-motion. Motion must explain a change (reordering, a card flipping, a stage finishing), never decorate.
12. Do not use placeholder copy like lorem ipsum. Write real interface text, short and plain.

## Visual tokens

- paper: #F5F2EC
- paper-2: #ECE8E0
- ink: #171512
- ink-2: #55514A
- line: #D9D4C9
- accent: #B8502F
- accent-2: #8F3B20
- ok: #3F6B4F
- warn: #A8741A
- dark-paper: #151412
- dark-ink: #EDE9E1
- dark-line: #2C2A26

Fonts through next/font: Instrument Serif for headings, DM Sans for body, JetBrains Mono for small labels and numbers. Do not use Inter.

## Phases

### Phase 0: scaffold
npm workspaces monorepo with apps/api and apps/web.
Root scripts: dev, build, test, fixtures, evaluate. evaluate forwards its arguments to apps/api and runs through tsx.
.env.example with every variable documented in README.
config/env.ts parses and validates env with zod.
Done when: npm install and npm test run on a clean clone.

### Phase 1: domain core (pure, test first)
Build and fully test, with no IO:
kit/schema.ts, kit/invariants.ts, kit/serialize.ts, kit/ids.ts.
requirements/groundRequirements.ts, inferPriority.ts, routeCategory.ts.
coverage/checkCoverage.ts, fallbackQuestions.ts.
schedule/allocateSchedule.ts, weights.ts, focusLabel.ts.
regeneration/itemState.ts, mergeRegenerated.ts.
practice/buildQueue.ts, mastery.ts.
Done when: all domain tests pass, including 1-day, 60-day, zero question and fewer-questions-than-days schedules, and an edit-during-regeneration merge test.

### Phase 2: retrieval
urlGuard.ts, safeFetch.ts, robots.ts, sitemap.ts, extractLinks.ts, rankLinks.ts, cleanPage.ts, crawler.ts.
discussion/hackerNews.ts, brave.ts, index.ts.
Per host rate limit and retry with backoff and jitter.
Fixture sites under apps/api/fixtures/sites and serveFixtures.ts on port 8099.
Done when: crawler tests find acme's hiring page, report harbor as having none, and record skipped sources without throwing.

### Phase 3: llm layer
client.ts interface, gemini.ts, groq.ts, mock.ts.
limiter.ts token bucket shared across calls, retry.ts honouring Retry-After.
jsonOutput.ts: tolerant parse, one repair call that includes the validation error, typed result.
untrusted.ts: nonce-delimited wrapping and escaping of closing delimiters.
Automatic fallback to the second provider when the first exhausts retries.
Done when: tests with the mock provider cover rate limit, invalid JSON, repaired JSON and provider fallback.

### Phase 4: pipeline
pipeline/stages/* and prompts/* as listed in README. Each category has its own prompt and its own call.
runPipeline.ts runs the stages in order, reports progress through a callback, checkpoints stage outputs, and applies a soft time budget that skips optional steps.
Pipeline takes plain input and returns a validated kit or a typed failure. No HTTP, no MongoDB.
Done when: pipeline.test.ts runs end to end against the fixture sites with the mock provider and shows the second pass closing a deliberately planted gap.

### Phase 5: batch command
cli/evaluate.ts, args.ts, report.ts.
Reads cases, runs with EVAL_CONCURRENCY, writes the Appendix B shape, writes incrementally, continues after failures, never connects to MongoDB, sets ALLOW_PRIVATE_HOSTS itself.
Done when: from a clean clone with only an API key set, five cases against the fixtures finish well inside fifteen minutes and the output validates against the Appendix A and B shapes.

### Phase 6: persistence and api
Mongo models and repositories. Unique index on (userId, fingerprint). Kit version with conditional updates.
Auth: register, login, logout, me. Session cookie, hashed tokens, sliding expiry, 401 on expiry.
Kits: create, list, get, patch item, add item, delete item, reorder, move, regenerate section, undo regeneration, change days.
Jobs: get, resume. jobRunner with limited concurrency and boot-time recovery of interrupted jobs.
Practice: record rating, get queue, get mastery. Middleware.
Done when: api tests cover auth boundaries, other-user access returning 404, duplicate submission returning the existing kit, and regeneration preserving edits through the real service.

### Phase 7: web foundation
Tailwind v4 tokens, fonts, dark mode via prefers-color-scheme.
AppShell, SkipLink, PageTransition, UI primitives, SessionGate.
Login and register pages.
lib/api/client.ts with typed errors.
Done when: signing in, signing out and an expired session all behave correctly.

### Phase 8: create and generation
CreateKitForm with textarea, company field, days input, inline validation.
BatchUpload for a file of description and company pairs.
GenerationTimeline: stage row with drawn line, states for waiting, running, done, skipped, failed.
Polling through usePolling with ETag.
Done when: every failure state in README has a visible, readable interface state.

### Phase 9: the builder
KitProvider with kitReducer for optimistic edits, useAutosave with debounce.
QuestionBoard with CategoryColumn and QuestionCard, dnd-kit.
InlineText, AddItemRow, PinToggle, RegenerateButton, RegenerationNotice.
Done when: editing is instant, a regenerate while an edit is pending keeps the edit, and a reorder works with keyboard only.

### Phase 10: kit views, practice, weak spots
Overview with BriefPanel, RolePanel, RequirementList, CoverageBadge.
ScheduleView and DayRow.
PracticeSession, FlipCard, ConfidenceScale, CoverageMeter.
WeakSpotsReport and MasteryBar with drill button.

### Phase 11: polish and deploy
Empty states, skeletons, error states with retry.
Responsive pass at 360 px and 1280 px, full keyboard pass, reduced motion pass.
Deploy configurations and /health check.
