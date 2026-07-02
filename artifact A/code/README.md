# Spotify Review Discovery Engine (Artifact A)

AI system that scrapes Spotify reviews (App Store + Play Store), tags them, embeds them into
a vector store, and serves **(1) an insights dashboard** and **(2) a grounded RAG chat** with
citations. Next.js app, deployable to Vercel.

See `../docs/architecture.md` and `../phases/*.md` for the design.

## Prerequisites

1. **OpenAI API key** → put in `.env.local` as `OPENAI_API_KEY` (copy `.env.example`).
2. (Optional) **Upstash Vector** creds in `.env.local` — otherwise a local JSON vector store
   (`data/vectors.json`) is used automatically.

## Build the data (one-time, needs the key)

```bash
npm install
npm run scrape          # pull ~3k reviews  -> data/reviews.raw.json   (no key needed)
npm run build:data      # enrich + embed + insights (uses OpenAI)      -> serving artifacts
```

`build:data` runs `enrich → index → insights` and produces:
`data/reviews.enriched.json`, `data/vectors.json`, `data/insights.json`.

### Offline dry-run (no key — validates plumbing only)

```bash
npm run scrape:small
node scripts/enrich.mjs --dry-run --limit 200
node scripts/index.mjs  --dry-run
node scripts/insights.mjs --dry-run
node scripts/ask.mjs --dry-run "why do users struggle to discover new music?"
```

## Run the app

```bash
npm run dev        # http://localhost:3000
# or: npm run build && npm run start
```

- `/`     Insights dashboard (reads `data/insights.json`)
- `/ask`  Grounded chat (calls `/api/chat` → retrieve + synthesise + cite)

## CLI helpers

| Command | What |
|---|---|
| `npm run scrape` | bulk scrape both stores |
| `npm run enrich` | tag reviews (gpt-4o-mini) |
| `npm run index`  | embed + upsert to vector store |
| `npm run ask -- "question"` | grounded answer in the terminal |
| `npm run insights` | rebuild dashboard payload + 6 brief answers |

## Deploy to Vercel

1. Push `artifact A/code` to a GitHub repo (root = this folder).
2. Import in Vercel. Set env vars: `OPENAI_API_KEY` (+ `UPSTASH_*` if using Upstash).
3. Ensure `data/vectors.json` + `data/insights.json` are committed (they're un-ignored in
   `.gitignore`) so the deployed app has data. Regenerate them with `npm run build:data`
   **before** committing — the repo currently holds dry-run placeholder data.
4. Deploy. Test `/` and `/ask` in an incognito window.

> Note: `/api/ingest` (the "refresh latest N" endpoint) needs the Node runtime and may hit
> serverless time limits on the free tier — bulk loading is the local `npm run scrape` path.
