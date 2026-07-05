# Discovery Compass Deployment

Artifact B is a full Next.js application with server routes. Deploy it as a Next.js project on
Vercel or as a Node web service on Render. Do not deploy it as a static site: intent parsing,
ranking, feedback, health, and event ingestion use server routes.

## Deployment matrix

| Mode | AI | Events | Intended use | Evaluation-ready? |
|---|---|---|---|---|
| Local technical | Deterministic fallback or OpenAI | Memory | Development and automated testing | No |
| Hosted preview | Deterministic fallback or OpenAI | Memory | Stakeholder review and moderated usability | No |
| Hosted evaluation | OpenAI with fallback | Neon PostgreSQL | Frozen paired participant study | Only after all gates pass |

The checked-in Vercel and Render configuration defaults are safe for a technical preview. Neither
configuration claims that the current seed catalog is ready for evaluation.

## Environment variables

| Variable | Preview | Evaluation | Secret? | Purpose |
|---|---|---|---|---|
| `OPENAI_API_KEY` | Optional | Required | Yes | Server-only intent and explanation calls |
| `DEFAULT_MODEL` | `gpt-4o-mini` | Frozen approved model | No | OpenAI model selection |
| `EVENT_STORE_MODE` | `memory` | `postgres` | No | Event-store adapter |
| `DATABASE_URL` | Omit | Required | Yes | Neon PostgreSQL connection string |
| `STUDY_VERSION` | Preview identifier | Frozen study identifier | No | Event and study version |
| `INTERVIEWS_COMPLETE` | `false` | `true` only after interviews | No | Human validation gate |
| `NODE_ENV` | `production` | `production` | No | Node runtime mode |

Never use a `NEXT_PUBLIC_` prefix for OpenAI or database credentials. Rotate any key that has
appeared in conversation, a screenshot, terminal output, or source control before deployment.

## Pre-deployment validation

From the repository root:

```bash
cd artifact-b/code
npm ci
npm run catalog:manifest
npm run validate
npm audit --omit=dev
```

The technical checks should pass. `npm run catalog:study-ready` is a separate product gate and is
expected to fail for the current 50-track seed.

## Deploy to Vercel

Vercel configuration is stored in `artifact-b/code/vercel.json`. Vercel expects that file in the
configured project root, so the project Root Directory must be `artifact-b/code`.

### Dashboard setup

1. Import this repository into Vercel.
2. Set **Root Directory** to `artifact-b/code`.
3. Keep **Framework Preset** as Next.js.
4. The checked-in configuration uses:

   ```text
   Install Command: npm ci
   Build Command: npm run catalog:manifest && npm run build
   Function Region: bom1
   ```

5. Add preview environment variables:

   ```text
   DEFAULT_MODEL=gpt-4o-mini
   EVENT_STORE_MODE=memory
   STUDY_VERSION=discovery-compass-vercel-preview-v1
   INTERVIEWS_COMPLETE=false
   ```

6. Optionally add a newly rotated `OPENAI_API_KEY` as an encrypted environment variable.
7. Deploy and open `/api/health`.

### CLI setup

Run the CLI from the code project root so `vercel.json` is discovered correctly:

```bash
cd artifact-b/code
npx vercel
npx vercel --prod
```

Do not run `vercel` from the repository root unless the CLI project is explicitly configured with
`artifact-b/code` as its root.

### Evaluation settings on Vercel

Before a participant study, change/add:

```text
EVENT_STORE_MODE=postgres
DATABASE_URL=<encrypted Neon connection string>
OPENAI_API_KEY=<encrypted rotated key>
STUDY_VERSION=<frozen study version>
INTERVIEWS_COMPLETE=true
```

Redeploy after changing environment variables and verify `eventStoreDurable`,
`eventStoreReachable`, and `evaluationReady` through `/api/health`.

## Deploy to Render

The Artifact B [render.yaml](../render.yaml) defines a Node web service and explicitly sets:

```yaml
rootDir: artifact-b/code
buildCommand: npm ci && npm run catalog:manifest && npm run typecheck && npm test && npm run build
startCommand: npm run start -- -p $PORT
healthCheckPath: /api/health
```

This repository already has a root Blueprint for Artifact A. During Render setup, select the
custom Blueprint path `artifact-b/render.yaml`.

### Blueprint setup

1. Push the repository to a Git provider connected to Render.
2. In Render, choose **New → Blueprint**.
3. Set the Blueprint file path to `artifact-b/render.yaml`.
4. Review the `discovery-compass` web service.
5. Apply the Blueprint.
6. Wait for `/api/health` to return HTTP 200.

The checked-in Blueprint deploys preview mode:

```text
EVENT_STORE_MODE=memory
INTERVIEWS_COMPLETE=false
```

This makes the first deployment usable without secrets while keeping `evaluationReady: false`.

### Manual Render service setup

If not using the Blueprint, create a **Web Service** with:

| Setting | Value |
|---|---|
| Runtime | Node |
| Region | Singapore |
| Root Directory | `artifact-b/code` |
| Build Command | `npm ci && npm run catalog:manifest && npm run typecheck && npm test && npm run build` |
| Start Command | `npm run start -- -p $PORT` |
| Health Check Path | `/api/health` |

Add the same preview or evaluation variables described above through Render's environment settings.

### Validate the Blueprint

If the Render CLI is installed and authenticated, run from the repository root:

```bash
render blueprints validate artifact-b/render.yaml
```

The Blueprint can also be reviewed through Render's Blueprint creation screen before it creates or
changes a service.

## Neon PostgreSQL event storage

Evaluation mode uses the official serverless PostgreSQL adapter already included in the codebase.
The application creates the `discovery_compass_events` table and its session/time index on first
use. The equivalent SQL is available at `artifact-b/code/scripts/neon-schema.sql` for manual review.

For manual provisioning:

```bash
psql "$DATABASE_URL" -f artifact-b/code/scripts/neon-schema.sql
```

Set a retention period and delete rehearsal/test sessions before collecting participant data.
Preview and evaluation deployments should use different database branches or databases.

## Health semantics

`GET /api/health` separates application liveness from research readiness:

```text
ok: true
technicalPrototypeReady: true
eventStoreReachable: true
evaluationReady: false
```

Vercel and Render only need a successful HTTP response for deployment health. A `false`
`evaluationReady` value is not a server failure; it means one or more product/research gates remain
open.

`evaluationReady` becomes true only when:

- the catalog manifest reaches the study thresholds;
- 5–6 interviews are complete and `INTERVIEWS_COMPLETE=true`;
- a rotated OpenAI key is configured;
- `EVENT_STORE_MODE=postgres`;
- `DATABASE_URL` is configured and reachable.

## Post-deployment smoke test

1. Load `/` on desktop and a 390px mobile viewport.
2. Confirm `/api/health` returns HTTP 200 without exposing secrets.
3. Select three anchors.
4. Interpret and approve current-session intent.
5. Generate ten guided recommendations.
6. Confirm every result has a source link and grounded explanation.
7. Reject one track and verify it does not immediately return.
8. Increase freshness and verify the visible change summary.
9. Complete guided and baseline condition ratings.
10. In evaluation mode, verify the paired events exist in PostgreSQL.
11. Export events and run `npm run study:analyze -- <export>`.

## Rollback

- Vercel: promote the last known-good deployment from the project Deployments screen.
- Render: roll back to the previous successful deploy from the service Events/Deploys view.
- Database: do not delete or rewrite historical study events during an application rollback. Freeze
  catalog, ranking, model, prompt, and study versions for every included session.

## Common deployment failures

### Build starts from the repository root

Set Vercel Root Directory or Render `rootDir` to `artifact-b/code`. A build from the repository root
will not find the Artifact B `package.json`.

### Render starts but cannot receive traffic

Keep `$PORT` in the Render start command. Render supplies that value at runtime.

### Health is 200 but evaluation readiness is false

Inspect the health fields. The current seed catalog and incomplete interviews intentionally keep
evaluation readiness false even when the application is healthy.

### Events disappear after restart

The service is still using `EVENT_STORE_MODE=memory`. Configure `postgres` plus `DATABASE_URL` for
durable evaluation events.

### OpenAI calls use fallback

Confirm the rotated `OPENAI_API_KEY` exists in the deployment environment and redeploy. The app
remains functional with deterministic parsing and template explanations when the provider fails.
