# Quickstart — Discovery Evidence Lab (Artifact A)

## Prerequisites

- Node.js 20.9 or newer.
- An OpenAI API key for real enrichment, embeddings, research answers, and chat.

## 1. Install

```bash
cd "artifact A/code"
npm install
```

The install intentionally retains `app-store-scraper@0.18.0` under `devDependencies` for the
optional legacy Apple adapter.

## 2. Configure environment

Copy `.env.example` to `.env.local` and set:

```bash
OPENAI_API_KEY=sk-...
DEFAULT_MODEL=gpt-4o-mini
SYNTHESIS_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
```

Do not commit `.env.local`. Rotate a key if it has been pasted into chat, source control, logs,
or screenshots.

## 3. Rebuild the corpus

### Store reviews

```bash
npm run scrape
```

This uses Apple public RSS by default and `google-play-scraper` for Play Store locales. To try
the retained legacy Apple library first:

```bash
APPLE_REVIEW_ADAPTER=legacy npm run scrape
```

The Apple adapter falls back to RSS if the legacy path returns no reviews.

### Reddit on a VPN-blocked network

The current project already contains the seven user-saved thread JSON inputs under
`data/reddit-raw/`. Re-import without making any live Reddit request:

```bash
npm run scrape:reddit:offline
```

To import additional browser-saved files from another location:

```bash
node scripts/scrape-reddit.mjs --no-live --file /absolute/thread-one.json --file /absolute/thread-two.json
```

The importer copies external inputs to a stable thread-id filename, parses posts/comments,
deduplicates them, and merges them into the raw corpus.

### Manifest and AI processing

```bash
npm run manifest
npm run enrich
npm run audit:enrichment
npm run index
npm run insights
```

Or run enrichment, indexing, and insights together:

```bash
npm run build:data
```

## 4. Evaluate

```bash
npm run eval:rag
npm run research
npm audit --omit=dev
npm run build
```

Expected verified baseline:

- 1,850 enriched records and 266 discovery-related records;
- 266 real vectors;
- zero schema errors;
- 9/9 automated RAG checks;
- zero production dependency vulnerabilities;
- successful Next.js build.

Automated checks are smoke tests. Human label quality, retrieval relevance, and citation
correctness still need independent review before presenting the findings as validated research.

## 5. Run

```bash
npm run dev
```

Open:

- `http://localhost:3000/` — Insights;
- `http://localhost:3000/ask` — cited RAG chat;
- `http://localhost:3000/collect` — bounded collection;
- `http://localhost:3000/api/health` — technical/data status.

CLI checks:

```bash
npm run ask -- "Why do users hear the same songs repeatedly?"
npm run query -- "Discover Weekly repetitive"
```

## No-key plumbing check

Dry-run modes validate control flow but do not create research-quality data:

```bash
npm run scrape:small
node scripts/enrich.mjs --dry-run --limit 200
node scripts/index.mjs --dry-run
node scripts/insights.mjs --dry-run
```

Dry-run vectors are written separately so they cannot replace the real index.
