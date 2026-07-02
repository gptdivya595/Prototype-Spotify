# Deployment — Vercel & Render

The app is a standard Next.js 14 (App Router) project living in **`artifact A/code`**.
Both platforms need that folder as the **root/base directory**.

## Before you deploy
1. Build the serving data locally with a real key:
   ```bash
   cd "artifact A/code"
   npm run scrape && npm run build:data
   ```
2. Confirm `data/vectors.json` and `data/insights.json` exist and are committed. They are
   **un-ignored** in `.gitignore` on purpose (they're the deployed corpus). The large
   `reviews.raw.json` / `reviews.enriched.json` stay ignored.
3. Confirm `.env.local` is **NOT** committed:
   ```bash
   git check-ignore "artifact A/code/.env.local"   # should print the path
   ```

---

## Option A — Vercel (recommended for Next.js)

1. Push the repo to GitHub.
2. In Vercel → **Add New Project** → import the repo.
3. **Root Directory**: set to `artifact A/code` (Vercel → Settings → General → Root Directory).
4. Framework preset: **Next.js** (auto-detected). Build = `next build`, Output = `.next`.
5. **Environment Variables** (Settings → Environment Variables), Production + Preview:
   | Key | Value |
   |---|---|
   | `OPENAI_API_KEY` | your key |
   | `DEFAULT_MODEL` | `gpt-4o-mini` |
   | `SYNTHESIS_MODEL` | `gpt-4o-mini` |
   | `EMBEDDING_MODEL` | `text-embedding-3-small` |
   | `UPSTASH_VECTOR_REST_URL` | *(only if using Upstash)* |
   | `UPSTASH_VECTOR_REST_TOKEN` | *(only if using Upstash)* |
6. Deploy. Test `/` and `/ask` in an incognito window.

**Notes**
- API routes use the Node runtime (`export const runtime = 'nodejs'`) — required by the
  vector store / scraper libs.
- `next.config.mjs` already includes `data/vectors.json` + `data/insights.json` in the
  serverless function bundle via `outputFileTracingIncludes`.
- `/api/ingest` may exceed the free-tier function timeout; bulk loading is the local
  `npm run scrape` path. `/` and `/ask` are fast.

---

## Option B — Render

Render hosts it as a **Web Service** (Node).

1. Push the repo to GitHub.
2. Render → **New** → **Web Service** → connect the repo.
3. **Root Directory**: `artifact A/code`
4. **Runtime**: Node
5. **Build Command**: `npm install && npm run build`
6. **Start Command**: `npm run start`
7. **Environment Variables**: same as the Vercel table above. Also set
   `NODE_VERSION` = `20` (or higher) if Render's default is older.
8. Instance type: Free or Starter is fine for this workload.
9. Create Web Service → wait for build → open the `.onrender.com` URL.

**Notes**
- Next.js binds to `$PORT` automatically via `next start`; Render provides `PORT`.
- Cold starts on the free tier can take ~30s; fine for a demo.
- Same data caveat: `data/vectors.json` + `data/insights.json` must be committed.

### Optional: render.yaml (Infrastructure-as-Code)
Place at repo root if you want one-click Blueprint deploys:
```yaml
services:
  - type: web
    name: spotify-review-engine
    runtime: node
    rootDir: artifact A/code
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: OPENAI_API_KEY
        sync: false
      - key: DEFAULT_MODEL
        value: gpt-4o-mini
      - key: SYNTHESIS_MODEL
        value: gpt-4o-mini
      - key: EMBEDDING_MODEL
        value: text-embedding-3-small
```

---

## Using Upstash Vector instead of the local store (optional)
If the committed `vectors.json` gets large or you want a live/shared index:
1. Create an Upstash Vector index (dimension **1536**, metric **cosine**).
2. Set `UPSTASH_VECTOR_REST_URL` + `UPSTASH_VECTOR_REST_TOKEN` (locally and on the host).
3. Re-run `npm run index` to populate Upstash. The app auto-detects and uses it; you no
   longer need to commit `vectors.json`.

---

## Post-deploy smoke test
- `GET /` → dashboard renders with real numbers.
- `GET /api/insights` → JSON payload.
- `POST /api/chat` with `{"question":"why do users struggle to discover new music?"}` →
  grounded answer + citations.
