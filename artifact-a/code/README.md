# Spotify Review Discovery Engine — Artifact A

A Next.js 16 research prototype that collects Spotify feedback, applies a controlled LLM
taxonomy, calculates deterministic insights, and answers qualitative questions through cited
RAG.

## Current verified dataset

- 1,850 records: 100 App Store, 1,200 Play Store, 550 Reddit.
- 266 discovery-related records and 266 real 1,536-dimension vectors.
- 1,850/1,850 enrichment records pass schema validation.
- 9/9 automated retrieval/scope checks pass.

See `../docs/architecture.md` for the completion audit and limitations.

## Requirements

- Node.js 20.9+.
- OpenAI API key in `.env.local`.
- Optional Upstash Vector credentials for hosted vector storage.

```bash
npm install
cp .env.example .env.local
```

Never commit `.env.local`. Rotate any key exposed in chat, logs, screenshots, or Git.

## Data pipeline

```bash
npm run scrape                  # Apple RSS + Google Play locale matrix
npm run scrape:reddit:offline   # import the seven saved Reddit JSON files, no live request
npm run manifest                # source/locale/rating/date coverage
npm run enrich                  # structured tags with checkpoint/retry
npm run audit:enrichment        # schema/conflict audit + sample
npm run index                   # real OpenAI embeddings
npm run insights                # deterministic aggregates + cited brief answers
npm run eval:rag                # automated retrieval/scope smoke checks
npm run research                # run the 15 PM research questions
```

`npm run build:data` runs `enrich → index → insights`.

### Apple adapters

Apple public RSS is the reliable default. `app-store-scraper@0.18.0` remains installed under
`devDependencies` as a CLI-only legacy adapter that is outside the Next.js application graph:

```bash
APPLE_REVIEW_ADAPTER=legacy npm run scrape
```

If the legacy adapter returns no reviews, collection falls back to RSS. Do not remove the
package unless this policy is intentionally changed.

### Additional saved Reddit files

```bash
node scripts/scrape-reddit.mjs --no-live \
  --file /absolute/path/thread-one.json \
  --file /absolute/path/thread-two.json
```

The script stores stable thread-id filenames in `data/reddit-raw/`, normalizes posts/comments,
and deduplicates before merging.

## Run the product

```bash
npm run dev
# or
npm run build && npm run start
```

| URL | Purpose |
|---|---|
| `/` | Coverage, deterministic themes, PM findings, limitations |
| `/ask` | Cited RAG with source/theme/segment filters |
| `/collect` | Bounded ingestion UI and storage-mode state |
| `/api/health` | Data/version/vector/storage health without secrets |

CLI helpers:

```bash
npm run ask -- "What controls over recommendations do users want?"
npm run query -- "Discover Weekly repetitive"
```

## Dry run

Dry runs check plumbing only and are not research evidence:

```bash
npm run scrape:small
node scripts/enrich.mjs --dry-run --limit 200
node scripts/index.mjs --dry-run
node scripts/insights.mjs --dry-run
```

Fake vectors are written to a separate file so they cannot overwrite the real index.

## Release checks

```bash
npm audit --omit=dev
npm run eval:rag
npm run build
```

The production dependency audit is clean. A full audit still reports advisories under the
retained dev-only legacy Apple scraper; it is not bundled as a production dependency.

For hosting modes, environment variables, and smoke tests, read `../docs/DEPLOYMENT.md`.
