# Quickstart — Review Discovery Engine (Artifact A)

Get from zero to a running app in ~10 minutes.

## 0. Prerequisites
- Node 18+ (tested on Node 25)
- An OpenAI API key

## 1. Install
```bash
cd "artifact A/code"
npm install
```

## 2. Add your key
Create `.env.local` (copy from `.env.example`):
```bash
OPENAI_API_KEY=sk-...
DEFAULT_MODEL=gpt-4o-mini
SYNTHESIS_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
```
> No Upstash needed — a local JSON vector store is used by default.

## 3. Build the data (one-time)
```bash
npm run scrape        # pull ~3k Spotify reviews  (no key needed)
npm run build:data    # enrich + embed + insights (uses OpenAI, ~$0.15, ~3 min)
```
Produces `data/reviews.enriched.json`, `data/vectors.json`, `data/insights.json`.

## 4. Run
```bash
npm run dev           # http://localhost:3000
```
- **/** — insights dashboard (frustration themes, segments, 6 AI-answered research questions)
- **/ask** — grounded chat; ask anything about discovery, get an answer with cited reviews

## 5. Sanity checks (optional, terminal)
```bash
npm run ask -- "why do users struggle to discover new music?"
npm run query -- "discover weekly repetitive"
```

## Offline / no-key mode
Every script supports `--dry-run` (stub tags + hash-embeddings) to validate the pipeline
without spending the key. See `code/README.md`.

## Next
Deploy with `docs/DEPLOYMENT.md` (Vercel or Render).
