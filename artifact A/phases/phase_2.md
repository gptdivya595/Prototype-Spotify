# Phase 2 — Enrich Reviews and Prove Label Quality

**Outcome:** every valid record has structured research labels, and a human audit shows how
reliable those labels are.

**Current status (2 July 2026):** **Technically complete; independent label validation pending**
— all 1,850 reviews are enriched, 266 are discovery-related, and all saved outputs pass schema
and conflict checks. An 87-record audit sample exists but does not yet contain human labels.

## Why this phase exists

LLM labels make thousands of reviews filterable and countable, but untested labels can create a
false root cause. This phase treats enrichment as a measurable classifier, not an oracle.

## Taxonomy

Retain the existing controlled vocabulary for the first evaluation:

```text
repetitive_recommendations
stale_discover_weekly
no_control_over_recs
recs_too_similar
recs_ignore_taste
algorithm_pushes_popular
autoplay_loop
hard_to_find_new_artists
poor_genre_exploration
no_explanation
ui_friction
non_discovery
```

Do not add themes mid-run. If the human audit finds a missing theme, version the taxonomy and
reprocess the whole corpus so counts remain comparable.

## Work plan

### 1. Version the prompt and output schema

Use OpenAI structured output for:

```text
id, sentiment, discoveryRelated, frustrationThemes, jtbd,
segment, segmentEvidence, summary, tagConfidence, tagVersion
```

- Treat review text as untrusted data, never as instructions.
- Set `discoveryRelated=false` and `non_discovery` for unrelated reviews.
- Default `segment=unknown` unless the text contains behavioral evidence.
- Keep “power user”, “explorer”, and similar labels behavioral—not demographic.

### 2. Make enrichment resumable

- Process batches of 15–25 reviews with bounded concurrency.
- Retry transient rate-limit/server errors with exponential backoff and jitter.
- Checkpoint completed ids; never pay twice for unchanged records.
- Validate enums, arrays, confidence range, and id coverage after every response.
- Fail the run if a batch is missing ids after retry; do not silently create a biased corpus.

### 3. Build the human-labelled evaluation set

Select at least 100 records stratified by:

- source;
- positive/neutral/negative rating or sentiment;
- locale;
- likely discovery-related and non-discovery records;
- short and long text.

The researcher labels `discoveryRelated`, themes, and whether segment evidence exists before
looking at the model output.

### 4. Score and inspect errors

Report:

- discovery precision, recall, and F1;
- per-theme support and multi-label agreement;
- segment evidence/unknown rate;
- false-positive and false-negative examples;
- model, prompt, taxonomy, and dataset versions.

Use errors to change definitions, examples, or thresholds. Do not tune against the test set and
then report the same set as independent evidence; keep a small holdout.

### 5. Generate deterministic distributions

Print counts by source, discovery relevance, sentiment, theme, and segment. Flag any label that
is concentrated in only one source or has fewer than ten examples.

## Existing implementation to retain

- `code/lib/schema.mjs`
- `code/lib/llm.mjs`
- `code/scripts/enrich.mjs`

## Verification

```bash
cd "artifact A/code"
node scripts/enrich.mjs --dry-run --limit 100
node scripts/enrich.mjs --limit 40
npm run enrich
npm run normalize:enrichment
npm run audit:enrichment
```

Dry-run validates plumbing only. It is not evidence that model quality passes.

## Deliverables

- `data/reviews.enriched.json`.
- `evals/enrichment-sample.jsonl` with human labels and no secrets.
- `evals/enrichment-results.json`.
- A versioned label guide explaining each theme and edge case.

## Exit criteria

- [x] 100% of saved model outputs pass the schema.
- [ ] Discovery precision ≥ 0.85 and recall ≥ 0.75 on the holdout.
- [ ] Multi-label theme agreement ≥ 0.75.
- [ ] At least 90% of non-`unknown` segment labels contain independently confirmed behavioral
      evidence.
- [x] Distribution report includes denominators and source/locale splits.
- [x] Enrichment checkpoints and resumes already-completed ids.

**Gate to Phase 3:** passed for exploratory retrieval with an explicit model-label warning.
Independent precision/recall/agreement remain a research gate before publication-quality claims.
