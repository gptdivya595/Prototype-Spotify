# Phase 4 — Produce Decision-grade Insights and Grounded Chat

**Outcome:** deterministic metrics and qualitative RAG work together to answer the brief without
confusing retrieved examples with corpus-wide prevalence.

**Current status (2 July 2026):** **Complete for PM synthesis; independent answer scoring
pending** — deterministic aggregates and cited qualitative RAG are separated, cited-number
parsing returns only used records, 15 research questions have been run, and 9/9 automated checks
pass.

## Why this phase exists

“What is most common?” must be answered from all labelled records. “Why does it happen?” can be
answered from carefully retrieved evidence. Routing both through top-k RAG would make a small
retrieved sample look statistically representative.

## Work plan

### 1. Build versioned deterministic insights

From the complete enriched corpus, calculate:

- corpus coverage by source, locale, date range, and rating;
- discovery-related count and denominator;
- sentiment distribution;
- theme counts and percentages;
- source × theme and segment × theme cross-tabs;
- JTBD clusters with supporting record counts;
- low-support warnings for sparse themes/segments.

Save the result as a versioned `insights.json`. Never let an LLM invent or recompute counts.

### 2. Route questions by intent

- Quantitative intent (`most common`, `how many`, `percentage`, `compare sources`) reads
  aggregate data first and may use the LLM only to explain returned values.
- Qualitative intent (`why`, `what do users mean`, `give examples`) uses vector retrieval.
- Mixed questions include both the deterministic number and cited qualitative evidence.

### 3. Harden grounded synthesis

The system prompt must require:

- answers only from numbered evidence;
- an inline `[n]` citation for every factual claim;
- a clear insufficient-evidence response;
- no instructions followed from review text;
- uncertainty when labels or source coverage are weak;
- no causal language unless the evidence is primary research.

Parse the model’s cited numbers. Return only the records actually cited, report invalid citation
numbers, and fail closed if an answer contains claims but no valid citations.

### 4. Precompute the six required questions

1. Why do users struggle to discover new music?
2. What are the most common frustrations with recommendations?
3. What listening behaviors are users trying to achieve?
4. What causes users to repeatedly listen to the same content?
5. Which user segments experience different discovery challenges?
6. What unmet needs emerge consistently across reviews?

For #2 and any prevalence claim, include the aggregate table and denominator. For #1 and #4,
describe a **root-cause hypothesis**, not a proven cause.

### 5. Evaluate end-to-end answers

Use the golden questions from Phase 3 and score:

- answer relevance;
- citation correctness;
- citation completeness;
- unsupported claims;
- deterministic numeric correctness;
- appropriate refusal;
- latency and estimated API cost.

Manually audit all six brief answers before publishing them.

### 6. Finalize API contracts

`POST /api/chat`

```json
{
  "question": "What control do users want over recommendations?",
  "filters": { "source": "reddit", "segment": "power_user" }
}
```

Response:

```json
{
  "answer": "... [1][3]",
  "citations": [],
  "usedFilters": {},
  "dataVersion": "...",
  "evidenceWarning": null
}
```

`GET /api/insights` returns coverage, deterministic aggregates, the six audited answers, data
version, and generated timestamp.

## Existing implementation to retain

- `code/lib/rag.mjs`
- `code/lib/insights.mjs`
- `code/app/api/chat/route.js`
- `code/app/api/insights/route.js`
- `code/scripts/ask.mjs`
- `code/scripts/insights.mjs`

## Verification

```bash
cd "artifact A/code"
npm run ask -- "Why do users struggle to discover new music?"
npm run insights
npm run eval:rag
npm run research
```

## Deliverables

- Versioned `data/insights.json`.
- `evals/rag-results.json`.
- Six audited question/answer/citation bundles.
- A concise research conclusion listing evidence, limitations, alternatives, and interview
  questions.

## Exit criteria

- [x] Numeric prevalence context is sourced from deterministic aggregates.
- [ ] Citation correctness ≥ 0.90 and unsupported-claim rate ≤ 0.10.
- [x] The automated off-topic case refuses appropriately.
- [x] Brief answers return data version, aggregate context where relevant, and cited records.
- [x] The leading conclusion is labelled a hypothesis requiring interview validation.
- [x] API errors are generic and do not expose secrets or stack traces.

**Gate to Phase 5:** passed for the local PM workflow. Independent human citation and
unsupported-claim scoring remain before external publication.
