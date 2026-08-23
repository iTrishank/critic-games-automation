# JOB_metacritic

Automation pipeline: scrapes Metacritic new-release games, stores them in MySQL, summarizes reviews with OpenAI, and serves the result through a Next.js UI. Runs hourly via scheduler or on-demand via a "Run Now" button — both call the same processing function.

## Stack

Next.js · React · TypeScript · Tailwind CSS · shadcn/ui · Feature-Sliced Design · Playwright · MySQL · Drizzle ORM · OpenAI API

## Features

- Playwright scraper for Metacritic (New Releases + SEE ALL/New pagination)
- Daily batch selection with dedup (upsert by `metacritic_id`, no duplicate rows)
- Multi-platform score tracking per game
- Separate AI-generated critic/user review summaries
- Hourly scheduler + manual "Run Now" trigger (shared entrypoint)
- Games list with search, platform filter, rating sort
- Game details page with similar-games recommendations
- Processing history / status tracking

## Prerequisites

- Node.js 18+
- MySQL instance
- OpenAI API key

## Setup

```bash
git clone <repo-url>
cd job-metacritic
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DATABASE_URL=mysql://user:password@localhost:3306/metacritic
OPENAI_API_KEY=sk-...
```

Run migrations:

```bash
npx drizzle-kit push
```

## Running

```bash
npm run dev
```

Trigger a processing run manually (no need to wait for the hourly scheduler):

```bash
curl -X POST http://localhost:3000/api/process
```

or use the **Run Now** button in the UI.

## Project Structure

```text
src/
├── app/        # Next.js routes + API (games, process, processing-status)
├── pages/      # games/, game-details/
├── widgets/    # game-grid, game-card, game-details, similar-games, processing-status
├── features/   # search-games, filter-games, sort-games, run-processing
├── entities/   # game/ (types, queries, domain model)
└── shared/     # db, lib, ui, config, types
```

## API

```text
GET  /api/games
GET  /api/games/:id
POST /api/process
GET  /api/processing-status
```

## Notes

- Scraper → normalized `ScrapedGame` → DB upsert → review scrape → OpenAI summary → save. No single giant transaction; OpenAI calls run outside the DB transaction.
- Missing reviews are stored as `"No reviews available"` rather than failing the game.
- Out of scope by design: auth, payments, microservices, Redis, Kubernetes, message queues, AI agents.

## License

MIT
