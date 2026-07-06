# Phase 3 — Build and Evaluate Retrieval

**Outcome:** discovery evidence can be retrieved by question and metadata with measured
relevance, source diversity, and stable citations.

**Current status (2 July 2026):** **Technically complete; human retrieval scoring pending** —
266 real 1,536-dimension vectors align with the discovery subset. Nine automated theme,
source-diversity, and scope checks pass, including evidence from all three source families.

## Why this phase exists

An answer can sound grounded while being based on irrelevant or duplicate reviews. Retrieval
quality must be evaluated separately from generation quality.

## Work plan

### 1. Freeze the embedding contract

- Embed `title + "\n" + text` using `text-embedding-3-small`.
- Record embedding model and dimension in index metadata and the run manifest.
- One store review is one retrieval unit.
- Split long discussion posts/comments on paragraph boundaries at roughly 800–1,200 characters;
  retain document id, chunk id, and parent URL.
- Index discovery-related records by default; provide an explicit `--all` research mode.

### 2. Keep two storage modes

- **Local:** `data/vectors.json` plus in-memory cosine search for development and a prebuilt demo.
- **Hosted:** Upstash Vector when `UPSTASH_VECTOR_REST_URL/TOKEN` are set.

Both backends must support the same structured filters:

```text
discoveryRelated, source, country, language, segment, theme, date range
```

Do not write to the local JSON vector file from a deployed Vercel Function.

### 3. Make indexing idempotent and incremental

- Embed in batches of up to 100.
- Cache by `id + contentHash + embeddingModel`.
- Upsert changed records; do not append duplicates.
- Detect a dimension mismatch before the first upsert and stop with an actionable error.
- Save vector count, skipped count, cost estimate, and failures.

### 4. Improve evidence selection without premature complexity

Start with dense top-20 or top-30 retrieval. Then:

- remove exact/near duplicates;
- enforce more than one source when evidence exists;
- keep 8–12 final evidence items;
- expose similarity score and applied filters for evaluation, not necessarily in the public UI.

Add keyword search, reciprocal-rank fusion, or an LLM reranker only if the benchmark shows a
specific failure that justifies it.

### 5. Create a golden retrieval set

Write at least 20 questions covering:

- the six brief questions;
- Discover Weekly repetition;
- ignored dislikes/taste;
- control users request;
- genre/language exploration;
- power-user and locale filters;
- source-specific questions;
- off-topic and unsupported questions.

For each, mark relevant record ids or judge the returned top five manually.

## Existing implementation to retain

- `code/lib/vectorstore.mjs`
- `code/lib/fakeembed.mjs`
- `code/scripts/index.mjs`
- `code/scripts/query.mjs`

## Verification

```bash
cd "artifact A/code"
node scripts/index.mjs --dry-run
npm run index
npm run query -- "Discover Weekly repeats familiar songs"
```

Never mix fake dry-run query vectors with a real vector index when judging relevance. Dry-run
only verifies control flow.

## Deliverables

- Local vector artifact and/or populated Upstash index.
- `evals/rag-questions.json`.
- `evals/rag-results.json` containing automated theme/source/scope results.
- Index manifest with model, dimension, vector count, and data version.

## Exit criteria

- [x] Vector count matches the intended enriched subset (266).
- [x] A full local re-index clears stale vectors and upserts unique ids; dry-run vectors are
      isolated from the real index.
- [x] Source, country, language, segment, and theme filters are enforced.
- [ ] Human-judged precision@5 ≥ 0.80 across the golden set.
- [x] Exact/near-duplicate evidence is removed before synthesis.
- [x] Unsupported/off-topic questions return no-evidence signals rather than forced results.

**Gate to Phase 4:** passed for prototype synthesis. Human precision@5 remains an independent
evaluation gate.
