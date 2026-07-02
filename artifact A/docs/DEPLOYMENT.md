# Deployment — Discovery Evidence Lab (Artifact A)

Discovery Evidence Lab is a Next.js 16 App Router project in `artifact A/code`. The first public deployment
should be **read-only**: serve the versioned insights/vector artifacts and keep bulk collection
and AI processing local.

## Release checks

```bash
cd "artifact A/code"
npm ci
npm audit --omit=dev
npm run eval:rag
npm run build
git check-ignore .env.local
```

Expected verified baseline on 2 July 2026:

- production audit: zero vulnerabilities;
- RAG smoke checks: 9/9;
- production build: pass;
- `data/vectors.json`: 266 real vectors;
- `data/insights.json`: data version `2026-07-02T07:33:08.208Z`.

The full audit includes six advisories in the deliberately retained, dev-only
`app-store-scraper` dependency chain. The legacy scraper is local-only and is not required by
the read-only production app.

## Data and secret rules

- Commit/version only the serving artifacts `data/vectors.json` and `data/insights.json`.
- Keep raw/enriched corpora, saved JSON imports, and `.env.local` private/ignored unless their
  licensing and privacy treatment has been explicitly reviewed.
- Put `OPENAI_API_KEY` in the host's encrypted environment settings.
- Rotate any API key that has appeared in chat, logs, screenshots, or Git history.
- Do not enable hosted ingestion with local JSON storage; Vercel function writes are ephemeral.

## Option 0 — static Discovery Evidence Lab brief

Use this when reviewers only need findings and the Artifact B handoff. It requires no Node
runtime, OpenAI key, vector database, or server function.

```bash
cd "artifact B/code/static"
python3 -m http.server 3099
```

Open `http://localhost:3099/`. The root `index.html` forwards to the self-contained
`artifact-A-summary.html` report.

For a static Vercel deployment, use `artifact B/code/static` as the project root and select the
Other framework preset with no build command. The static option intentionally excludes live
Ask, Collect, and ingestion capabilities.

## Option A — Vercel read-only deployment

1. Push the repository to GitHub.
2. In Vercel, import the repository.
3. Set **Root Directory** to `artifact A/code`.
4. Keep the auto-detected Next.js framework, `next build`, and `.next` output.
5. Add these environment variables for Production and Preview:

   | Key | Value |
   |---|---|
   | `OPENAI_API_KEY` | rotated OpenAI key |
   | `DEFAULT_MODEL` | `gpt-4o-mini` |
   | `SYNTHESIS_MODEL` | `gpt-4o-mini` or another approved model |
   | `EMBEDDING_MODEL` | `text-embedding-3-small` |

6. Do **not** set an ingest admin key or remote-ingest flag in the first release.
7. Deploy and verify `/`, `/ask`, `/collect`, `/api/insights`, and `/api/health`.

`vercel.json` contains the framework/build settings and function duration limits.
`next.config.mjs` includes the two serving artifacts in API function traces.

### Expected read-only behavior

- Insights and Ask read the deployed artifact version.
- Chat calls OpenAI server-side and may create API cost, so retain rate limiting.
- Collect explains the current storage mode.
- Production `/api/ingest` returns a blocked response because durable remote ingestion is not
  configured.

## Optional hosted refresh

Only enable this after creating an Upstash Vector index with dimension 1,536 and cosine
similarity:

| Key | Purpose |
|---|---|
| `UPSTASH_VECTOR_REST_URL` | Remote vector endpoint |
| `UPSTASH_VECTOR_REST_TOKEN` | Remote vector credential |
| `ALLOW_REMOTE_INGEST` | Must be exactly `true` |
| `INGEST_ADMIN_KEY` | Strong secret supplied in `x-ingest-key` |

The route caps a request at 100 records and accepts only known source/country/language values.
This refresh updates the vector index, not the full deterministic insights snapshot; continue
to rebuild and redeploy insights after a controlled bulk corpus update.

## Option B — Render

Render can host the same read-only app as a Node web service:

1. Set Root Directory to `artifact A/code`.
2. Use `npm ci && npm run build` as the build command.
3. Use `npm run start` as the start command.
4. Use Node 20.9 or newer.
5. Add the same OpenAI/model variables as the Vercel read-only deployment.

Render may have a writable disk during a process lifetime, but do not treat it as durable
research storage unless a persistent disk/database is explicitly configured.

## Post-deploy smoke test

Record the URL, deployment time, Git revision, and displayed data version. Then verify:

```text
GET  /                     → 200 and coverage/theme counts render
GET  /ask                  → 200 and filters render
GET  /collect              → 200 and correct storage mode renders
GET  /api/insights         → 200 with dataVersion
GET  /api/health           → 200 with 1,850 corpus / 266 vectors and no secrets
POST /api/chat             → grounded answer with valid citations
POST /api/chat off-topic   → scope refusal
POST /api/ingest           → blocked in read-only production
```

Also test in an incognito browser and on a phone. A public deployment is complete only after
the URL and smoke-test evidence are recorded; a passing local build is not deployment proof.
