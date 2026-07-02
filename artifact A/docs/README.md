# Discovery Evidence Lab (Artifact A)

Discovery Evidence Lab is a working product-research prototype for analysing Spotify discovery feedback.
It combines deterministic corpus analysis with cited RAG so a PM can distinguish recurring
patterns from individual examples.

“Artifact A” remains the delivery-stage and folder label for compatibility; Discovery Evidence
Lab is the user-facing product name.

## Verified local state — 2 July 2026

| Item | Result |
|---|---:|
| Raw/enriched corpus | 1,850 records |
| App Store | 100 |
| Play Store | 1,200 |
| Reddit | 550 across seven saved threads |
| Discovery-related subset | 266 |
| Real embedding vectors | 266 at 1,536 dimensions |
| Enrichment schema audit | 1,850/1,850 pass |
| Automated RAG checks | 9/9 pass |
| Production dependency audit | 0 vulnerabilities with `--omit=dev` |
| Next.js production build | Pass |

The prototype is technically complete locally. Human label/citation evaluation, 5–6 user
interviews, and a verified public Vercel deployment are still open gates.

A zero-runtime summary is also available at
`../../artifact B/code/static/artifact-A-summary.html`. It packages the evidence and product
handoff as one self-contained HTML file for review or static deployment.

## Experience

- `/` — coverage, deterministic theme counts, research findings, and limitations.
- `/ask` — grounded chat with source/theme/segment filters and visible citations.
- `/collect` — bounded collection UI with truthful local/hosted storage behavior.
- `/api/health` — corpus, vector, data-version, and storage status without secrets.

## How it works

```text
App Store RSS / retained legacy adapter + Google Play + saved Reddit JSON
        ↓
normalise · dedupe · manifest
        ↓
structured LLM enrichment · validation · audit
        ↓
deterministic aggregates + vector retrieval
        ↓
Insights + cited research chat
```

`app-store-scraper@0.18.0` is retained as a CLI-only legacy adapter. Apple RSS is the default
because the legacy endpoint returned zero Spotify reviews in the verified run; setting
`APPLE_REVIEW_ADAPTER=legacy` tries it first and falls back safely.

## Documents

| File | Purpose |
|---|---|
| [architecture.md](architecture.md) | Completion audit, source design, RAG, APIs, security, gates |
| [Ingestion Input.md](Ingestion%20Input.md) | Actual corpus coverage and source instructions |
| [QUICKSTART.md](QUICKSTART.md) | Install, rebuild, evaluate, and run locally |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Vercel/Render modes and production checks |
| `../phases/phase_1.md` … `phase_5.md` | Five phased execution/evidence plans |

Root research docs now include the full RAG answers, Smart Shuffle follow-up,
`Solutioning.md`, and the Artifact B experiment rationale.

Runnable code lives in [`../code`](../code). The root `docs/` folder contains the PM research
synthesis and the recommended Artifact B experiment.
