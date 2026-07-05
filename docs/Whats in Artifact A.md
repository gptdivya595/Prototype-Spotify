# Discovery Evidence Lab (Artifact A)

**Discovery Evidence Lab** is the product name for the evidence engine delivered as Artifact A.
It decides what should be tested in Artifact B through a working Next.js application with a
reproducible data pipeline, deterministic aggregates, and grounded RAG chat.

The repository folder remains `artifact A` so existing commands and links continue to work.
“Solutioning” names the decision process documented in `Solutioning.md`, not the research product.

## Final verified state — 2 July 2026

| Item | Verified result |
|---|---:|
| Unique feedback records | 1,850 |
| App Store | 100 |
| Play Store | 1,200 |
| Reddit posts/comments | 550 across 7 threads |
| Discovery-related after conservative cleanup | 266 |
| Vector records | 266, dimension 1,536 |
| Structured-label schema conflicts | 0 |
| Automated retrieval checks | 9/9 passed |
| Production dependency audit | 0 vulnerabilities with `--omit=dev` |
| Next.js production build | Passed |
| Local page/API smoke tests | Passed |

`app-store-scraper@0.18.0` remains available as a CLI-only legacy adapter because it was
requested, but it currently returns zero Spotify reviews. Apple RSS is the default and the
legacy adapter automatically falls back to RSS. Keeping it in `devDependencies` prevents its
deprecated `request` chain from entering the Next.js application import graph and Vercel
production trace.

## What the application contains

### Insights — `/`

- corpus and source coverage;
- discovery-related count and overall sentiment;
- deterministic ranked theme counts;
- inferred behavior-segment counts;
- six precomputed research answers with only the citations actually used;
- explicit warning that review findings are hypotheses pending interviews.

### Ask — `/ask`

- grounded chat over the 266-record discovery index;
- source, theme, and inferred-segment filters;
- automatic theme routing for focused questions;
- source-diverse retrieval and near-duplicate removal;
- inline citations, source links, evidence warnings, and data version;
- out-of-scope refusal and per-IP rate limiting.

### Collect — `/collect`

- bounded App Store/Play Store sample collection;
- country, language, and limit controls;
- structured enrichment and vector upsert;
- local mode for research and an admin gate for production;
- hosted writes disabled unless durable remote vector storage is configured.

### Health — `/api/health`

Reports storage mode, vector count, corpus counts, data version, and whether remote ingestion is
enabled—without exposing secrets.

### Static evidence brief

`artifact-b/code/public/artifact-A-summary.html` is a self-contained, read-only summary of the
corpus, RAG findings, Smart Shuffle follow-up, problem hypothesis, and Artifact B decision. It can
be served without Next.js, OpenAI, a vector database, or environment variables. An `index.html`
entry point makes the same brief available at the static server root.

## Data pipeline

```text
Apple RSS / app-store-scraper fallback + google-play-scraper + saved Reddit JSON
  → normalize and deduplicate
  → ingestion manifest
  → GPT-4o mini structured enrichment
  → deterministic validation and operational-complaint cleanup
  → text-embedding-3-small
  → local JSON or Upstash vector index
  → aggregate analysis + source-diverse RAG
  → Insights / Ask / Collect UI
```

### Why saved Reddit JSON is the primary path

Reddit returns HTTP 403 through the current VPN/network. The seven manually downloaded JSON
files are preserved under `data/reddit-raw/<thread-id>.json`. The offline importer parses the
post and nested comments, deduplicates them, and does not require Reddit network access.

## Why RAG is used

- The corpus is too large for one prompt or manual reading.
- Retrieval brings the most relevant records into a small auditable context.
- The answer must cite the exact records it used.
- Prompt-injection text inside reviews is treated as untrusted data.
- Deterministic aggregate facts are injected for count/prevalence questions.

RAG does **not** establish prevalence by itself. Theme counts come from all 266 classified
discovery records; RAG explains those patterns and supplies examples.

## Final quantitative findings

| Theme | Count |
|---|---:|
| Recommendations ignore taste | 72 |
| Repetitive recommendations | 70 |
| Recommendations too similar | 50 |
| Algorithm pushes popular/safe music | 49 |
| Stale Discover Weekly | 48 |
| No control over recommendations | 46 |
| Poor genre exploration | 19 |
| Autoplay/repetition loop | 14 |
| Hard to find new artists | 14 |
| Discovery UI friction | 10 |
| No explanation | 6 |

These are multi-label counts within a purposefully sampled, complaint-enriched corpus. They are
not Spotify-wide percentages.

## What the 15-question RAG run established

- The central pattern is **taste mismatch + repetition**, not simply missing controls.
- Power users describe large libraries collapsing into a small recurring rotation.
- Users explicitly request familiar-versus-new control, exclusions, profile repair, and broader
  discovery.
- Some people use private sessions, external discovery tools, or new accounts to manage their
  recommendation profile.
- Discovery failures are mentioned as a reason to consider or complete switching services.
- Discover Weekly has mixed evidence; Daylist and Release Radar have positive advocates.
- A targeted Smart Shuffle query found repeated small subsets and controls that re-enable
  themselves.
- Explanations are a weaker opportunity signal than relevance, freshness, and control.
- Language exploration remains under-evidenced compared with genre exploration.

The full question bank is in [RAG Questions.md](RAG%20Questions.md).

The evidence-to-solution rationale is in [Solutioning.md](Solutioning.md); the detailed product
experiment remains in [Artifact B Recommendation.md](Artifact%20B%20Recommendation.md).

## What Discovery Evidence Lab does not prove

- It does not prove a causal root cause.
- It does not represent all Spotify users.
- LLM segment labels are hypotheses, not verified personas.
- Automated retrieval checks are not a substitute for interview validation.
- It does not prove that the proposed Artifact B interaction will improve listening outcomes.

## Reproduce the final pipeline

```bash
cd "artifact A/code"
npm install
npm run scrape
npm run scrape:reddit:offline
npm run manifest
npm run enrich
npm run normalize:enrichment
npm run audit:enrichment
npm run index
npm run eval:rag
npm run insights
npm run research
npm run build
```

Run the application with `npm run dev`, then open `/`, `/ask`, and `/collect`.

## Product decision produced

Discovery Evidence Lab supports testing an **Intent-guided Discovery Session** in Artifact B: the listener
states what they want now, adjusts freshness, excludes unwanted directions, and receives a small
set of explained recommendations from a curated prototype catalog. See
[Artifact B Recommendation.md](Artifact%20B%20Recommendation.md).
