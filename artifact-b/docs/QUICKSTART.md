# Discovery Compass Quickstart

This guide runs the Artifact B Next.js application from `artifact-b/code` in local development or
local production mode.

## Prerequisites

- Node.js 20.9 or later.
- npm 10 or later.
- A terminal opened at the repository root.

The application can run without OpenAI or PostgreSQL. In that mode it uses deterministic intent
parsing, grounded template explanations, and an in-memory event store.

## 1. Install

```bash
cd artifact-b/code
npm ci
```

Use `npm install` only when intentionally changing dependencies. Deployment uses `npm ci` and the
committed lockfile.

## 2. Configure local environment

```bash
cp .env.example .env.local
```

The default technical-preview values are:

```text
OPENAI_API_KEY=
DEFAULT_MODEL=gpt-4o-mini
EVENT_STORE_MODE=memory
DATABASE_URL=
STUDY_VERSION=discovery-compass-pilot-v1
INTERVIEWS_COMPLETE=false
```

Leave `OPENAI_API_KEY` empty to test the complete deterministic fallback. If you test the live AI
path, use a newly rotated key and keep it only in `.env.local` or the hosting platform's encrypted
environment settings.

## 3. Generate and validate the catalog manifest

```bash
npm run catalog:manifest
npm run catalog:validate
```

Expected current result:

```text
structurallyValid: true
studyReady: false
tracks: 50
artists: 40
```

`studyReady: false` is intentional. The seed catalog is enough for technical testing but does not
meet the planned 300–500-track and 120-artist evaluation threshold.

## 4. Start development mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 5. Verify the main flow

1. Keep the **Guided** condition selected.
2. Select three to five taste-anchor tracks.
3. Interpret the example current-session intent.
4. Review and approve the editable fields.
5. Generate the ten-track guided set.
6. Use **Not for me**, **More like this**, or **More adventurous**.
7. Confirm the change summary and reranked set.
8. Complete the condition ratings.
9. Switch to **Baseline** and use the same taste anchor.

The baseline intentionally omits current intent, novelty controls, exclusions, and steering.

## 6. Run all technical validation

```bash
npm run validate
npm audit --omit=dev
```

`npm run validate` runs catalog validation, strict TypeScript checking, automated tests, and the
production Next.js build.

## 7. Run local production mode

```bash
npm run build
npm run start -- -p 3100
```

Open [http://localhost:3100](http://localhost:3100), then check:

```bash
curl --fail http://localhost:3100/api/health
```

Current local health should report:

```text
technicalPrototypeReady: true
eventStore: memory
eventStoreDurable: false
interviewsComplete: false
evaluationReady: false
```

## Useful commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start Next.js development mode |
| `npm run typecheck` | Run strict TypeScript validation |
| `npm test` | Run unit and contract tests |
| `npm run build` | Create the production build |
| `npm run validate` | Run catalog, types, tests, and build |
| `npm run catalog:manifest` | Regenerate `data/catalog.manifest.json` |
| `npm run catalog:validate` | Validate structure and print readiness |
| `npm run catalog:study-ready` | Fail until study-size thresholds are met |
| `npm run study:analyze -- <file>` | Calculate metrics from JSON or JSONL events |

## Common problems

### Port already in use

```bash
npm run dev -- -p 3101
```

### AI path uses fallback

Check that `.env.local` contains a valid rotated `OPENAI_API_KEY`, then restart the server. The UI
shows whether structured AI output or deterministic fallback was used.

### Evaluation readiness stays false

That is expected until the full catalog, interviews, rotated OpenAI key, and reachable durable
PostgreSQL event store are all configured.

### Events disappear after restart

`EVENT_STORE_MODE=memory` is intentionally non-durable. Use the PostgreSQL configuration in
[DEPLOYMENT.md](DEPLOYMENT.md) for an evaluation environment.
