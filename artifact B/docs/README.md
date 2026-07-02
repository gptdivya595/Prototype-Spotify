# Discovery Compass (Artifact B)

Discovery Compass is the bounded product experiment recommended by Discovery Evidence Lab. It
tests whether active music explorers accept more unfamiliar artists when they can express current
intent, control novelty, exclude unwanted directions, and immediately steer a recommendation set.

Artifact B is not a Spotify clone, playback client, production recommender, or general chatbot.

## Current result

The five technical phases are implemented as one Next.js application under `artifact B/code`:

- a controlled baseline and guided condition using the same catalog and cards;
- editable session-intent parsing with deterministic fallback;
- deterministic exclusions, relevance, novelty, diversity, repeat suppression, and artist caps;
- grounded explanations and immediate feedback-driven reranking;
- privacy-minimized condition events, ratings, health readiness, and reproducible analysis;
- Vercel configuration and a Render Blueprint targeting the code directory.

The application is a **technical prototype**, not a completed participant study. The catalog,
interviews, hosted database configuration, usability test, and paired evaluation remain open.

## Start locally

```bash
cd "artifact B/code"
npm ci
cp .env.example .env.local
npm run catalog:manifest
npm run validate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A key and database are optional for local
technical mode because the application has complete deterministic and in-memory fallbacks.

## Documents

| Document | Purpose |
|---|---|
| [architecture.md](architecture.md) | Runtime, data, API, AI, ranking, experiment, privacy, and deployment design |
| [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) | What is implemented, verified, and still blocked |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Local, Vercel preview, Neon evaluation, readiness, and smoke checks |
| [QUICKSTART.md](QUICKSTART.md) | Install, configure, run, validate, and troubleshoot locally |
| [phase_1.md](../phases/phase_1.md) | Validate the problem; establish catalog, baseline, and measurement |
| [phase_2.md](../phases/phase_2.md) | Build schema-validated intent parsing and editable interpretation |
| [phase_3.md](../phases/phase_3.md) | Implement deterministic filtering, novelty, diversity, and ranking |
| [phase_4.md](../phases/phase_4.md) | Build the recommendation, explanation, and immediate-steering experience |
| [phase_5.md](../phases/phase_5.md) | Run paired evaluation, harden, deploy, and make the product decision |

## Evidence and product rationale

- [Artifact B Recommendation](../../docs/Artifact%20B%20Recommendation.md)
- [Solutioning](../../docs/Solutioning.md)
- [Problem Statement](../../docs/ProblemStatement.md)
- [RAG Questions](../../docs/RAG%20Questions.md)

## Deployment files

| File | Target |
|---|---|
| [`../code/vercel.json`](../code/vercel.json) | Vercel project whose Root Directory is `artifact B/code` |
| [`../render.yaml`](../render.yaml) | Artifact B Render Blueprint with `rootDir: "artifact B/code"` |
| [`../code/.env.example`](../code/.env.example) | Local and hosted environment-variable contract |
| [`../code/scripts/neon-schema.sql`](../code/scripts/neon-schema.sql) | Optional manual event-table provisioning |

## Validation commands

```bash
cd "artifact B/code"
npm run validate
npm audit --omit=dev
```

The dedicated study-size gate is intentionally separate:

```bash
npm run catalog:study-ready
```

It must remain failing until the catalog has been expanded and reviewed.

## Delivery rule

Each phase has a measurable exit gate. A phase is not complete because its UI exists; it is
complete only when its contracts and validation evidence pass. Phase 1 interviews can change the
scope before implementation is locked.
