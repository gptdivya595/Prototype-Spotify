# Phase 5 — Ship the Collect, Insights, and Ask Experience

**Outcome:** an evaluator can open one Vercel URL, understand corpus limitations, inspect
evidence, and test a grounded question.

**Current status (2 July 2026):** **Complete locally; public deployment pending** — Collect,
Insights, Ask, health, bounded API controls, production dependency remediation, build, and local
smoke tests pass. No public Vercel URL has been deployed or verified.

## User flow

```text
Collect a bounded sample → see run result/freshness → inspect ranked insights → ask a question
→ open cited source evidence → understand what must be validated in interviews
```

## Work plan

### 1. Complete the three-page UI

#### Collect

- Source dropdown: App Store or Play Store; Reddit/community import is local-file/admin only.
- Country and language allow lists.
- Limit selector capped at 100 for hosted refresh.
- Clear mode badge: `local`, `hosted read-only`, or `hosted remote storage`.
- Run button, loading state, counts, partial failures, and last successful data version.
- Admin gate for the action; no consumer account system.

#### Insights

- Corpus size, source/locale/date coverage, and last generated timestamp.
- Ranked theme counts with denominators, not only bars.
- Source × theme and segment × theme views.
- Six audited answers with evidence warnings and expandable citations.
- A visible “hypothesis to validate” panel and sampling limitations.

#### Ask

- Question input and example research questions.
- Optional source, segment, theme, and locale filters.
- Loading, empty-evidence, rate-limit, and API-error states.
- Inline citation markers plus a source panel containing rating, date, short quote, and link.
- Never claim “no hallucinations”; say answers are constrained to retrieved evidence and may
  still require audit.

### 2. Make persistence behavior truthful

Choose one deployment mode and show it in the UI:

1. **Recommended first release — read-only Vercel:** serve committed/versioned vectors and
   insights; Collect runs locally and requires regeneration/redeploy.
2. **Optional hosted refresh:** configure Upstash Vector plus durable snapshot storage and enable
   `/api/ingest` only with `ALLOW_REMOTE_INGEST=true`.

Do not let `/api/ingest` write to local JSON in production and report success; Vercel function
filesystem writes are not the durable database.

### 3. Add public-endpoint controls

- Keep the OpenAI key server-side.
- Cap chat question length and output tokens.
- Per-IP rate-limit `/api/chat`.
- Protect `/api/ingest` with an admin key and a hard limit of 100.
- Use only allow-listed source/country/language values; never accept a scrape URL.
- Return generic client errors and structured server logs without review text or secrets.

### 4. Remediate release dependencies

The 2 July 2026 production audit reports zero advisories with `npm audit --omit=dev`.

- Next.js has been upgraded to 16.2.10 and the build has been rerun.
- `app-store-scraper@0.18.0` is deliberately retained as a local-only dev dependency.
- The legacy adapter uses a dynamic import and is not required by the read-only deployment.
- A full audit still reports six advisories under its deprecated `request` dependency chain;
  this is documented isolation, not a claim that the legacy package itself is remediated.
- Do not run `npm audit fix --force` without reviewing the major-version migrations.

### 5. Deploy and smoke-test Vercel

- Set Vercel root directory to `artifact A/code`.
- Add `OPENAI_API_KEY`, model variables, and optional Upstash variables in Vercel settings.
- Use the Node runtime for API routes.
- Include only required serving artifacts in function traces.
- Test the production URL in incognito and on a phone.
- Verify the displayed data version equals the deployed vector/insights version.

### 6. Prepare the PM handoff

Create a one-slide-ready story:

- source coverage and method;
- deterministic leading themes;
- two or three representative cited examples;
- limitations;
- target interview segment and questions;
- explicit statement that interviews decide Artifact B.

## Existing implementation to retain

- `code/app/page.jsx`
- `code/app/ask/page.jsx`
- `code/app/api/ingest/route.js`
- `code/app/globals.css`
- `code/vercel.json`
- `code/next.config.mjs`

## Verification

```bash
cd "artifact A/code"
npm ci
npm audit --omit=dev
npm run build
npm run start
```

Smoke tests:

```text
GET  /                 → insights and coverage render
GET  /api/insights     → 200 with dataVersion
POST /api/chat         → cited grounded answer
POST /api/chat off-topic → insufficient-evidence response
POST /api/ingest       → blocked unless admin/remote mode is enabled
GET  /api/health       → build/data/storage status without secrets
```

## Deliverables

- Public Vercel URL.
- Collect, Insights, and Ask screenshots.
- Post-deploy smoke-test record.
- Updated deployment guide and environment-variable checklist.
- One-slide workflow/findings content.

## Exit criteria

- [ ] Insights and Ask work from a public incognito session.
- [x] Collect accurately reflects the configured persistence mode and cannot create unbounded
      public API spend.
- [x] A new local chat answer contains valid, clickable evidence or an honest refusal.
- [x] No high/critical production dependency advisory remains without a written, reviewed
      isolation decision.
- [ ] Confirm no exposed secret remains after rotating the key and reviewing Git/client output.
- [x] Local mobile-responsive, keyboard, loading, and error states are implemented.
- [ ] Public URL, data version, and smoke-test date are recorded.
- [x] The handoff identifies interview hypotheses instead of claiming a proven root cause.

**Artifact A is locally complete as a technical prototype.** Public-deployment, independent
human evaluation, API-key rotation, and interview gates remain explicitly open; none should be
reported as complete without evidence.
