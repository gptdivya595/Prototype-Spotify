# Discovery Compass application

This is the working Artifact B experiment. It compares an unsteered taste-anchor baseline with a
guided condition that adds approved current-session intent, novelty, exclusions, explanations,
and immediate feedback.

## Run locally

```bash
npm install
npm run catalog:manifest
npm run validate
npm run dev
```

Open `http://localhost:3000`.

The application works without an OpenAI key by using deterministic intent parsing and grounded
template explanations. Create `.env.local` from `.env.example` with a newly rotated key to exercise
the server-only AI adapters.

## Important commands

| Command | Purpose |
|---|---|
| `npm run catalog:validate` | Structural validation plus truthful study-readiness report |
| `npm run catalog:study-ready` | Fails until the catalog reaches study thresholds |
| `npm test` | Unit and contract tests |
| `npm run typecheck` | Strict TypeScript validation |
| `npm run build` | Production Next.js build |
| `npm run validate` | Catalog, types, tests, and build |
| `npm run study:analyze -- <file>` | Reproduce metrics from validated JSON/JSONL events |

## Current readiness

- Technical prototype: implemented locally.
- Study catalog: not ready; 50 tracks and 40 artists versus the planned 300–500 tracks and at
  least 120 artists.
- Interviews: not complete.
- Hosted durable event store: adapter implemented, credentials not configured.
- Formal paired study: not run.

See [IMPLEMENTATION_STATUS.md](../docs/IMPLEMENTATION_STATUS.md) for phase-by-phase evidence.

For setup and hosting:

- [Quickstart](../docs/QUICKSTART.md)
- [Vercel and Render deployment](../docs/DEPLOYMENT.md)
- [Artifact B documentation index](../docs/README.md)
