# Prepkit

Prepkit turns a pasted job description and a company website into an interview preparation kit: a company brief, a role breakdown, a categorised question bank, flashcards and a day-by-day schedule. The kit is built by a staged pipeline that researches the company first, then generates, then checks its own coverage and closes the gaps. Every part of the kit can be edited, reordered, regenerated and practised against.

## Stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Frontend | Next.js (App Router) + Tailwind CSS v4 + framer-motion | Required stack. Motion is used for layout transitions, card flips and progress, never as decoration |
| Backend | Node.js + Express, TypeScript | Required stack. TypeScript keeps the kit schema and pipeline contracts honest |
| Database | MongoDB (Atlas M0) | A kit is one nested document that is read and written as a whole |
| Validation | zod | One schema drives request validation, LLM output validation and kit validation |
| LLM | Google Gemini free tier, Groq as fallback provider | See LLM section |
| Scraping | undici + cheerio + @mozilla/readability | Small, controllable, no headless browser needed on free hosting |
| Tests | vitest | Fast, TypeScript native |
| Hosting | Vercel (web), Render (api), Atlas M0 (db) | All free tiers |

## Repository layout

```
prepkit/
  package.json
  .env.example
  README.md
  AGENT_BRIEF.md
  apps/
    api/
      package.json
      tsconfig.json
      vitest.config.ts
      fixtures/
        sites/
          acme/
          harbor/
          blank/
        serveFixtures.ts
        cases.sample.json
      src/
        server.ts
        app.ts
        config/
          env.ts
          constants.ts
        http/
          routes/
          controllers/
          middleware/
        domain/
          kit/
          requirements/
          coverage/
          schedule/
          regeneration/
          practice/
        pipeline/
          stages/
          prompts/
        retrieval/
          discussion/
        llm/
        persistence/
          models/
          repositories/
        services/
        cli/
          evaluate.ts
          args.ts
          report.ts
      tests/
    web/
      package.json
      next.config.ts
      postcss.config.mjs
      src/
        app/
        components/
        lib/
```

## Setup

Requirements: Node 20 or newer, a MongoDB connection string for the web app, one LLM API key.

Run the web app locally:
```bash
git clone <repo-url> prepkit
cd prepkit
npm install
cp .env.example .env
npm run dev
```

The api listens on `http://localhost:4000` and the web app on `http://localhost:3000`.

Run the tests:
```bash
npm test
```

Run the batch entry point:
```bash
npm run evaluate -- --input apps/api/fixtures/cases.sample.json --output kits.json
```

To run against the bundled fixture sites:
```bash
npm run fixtures
```
