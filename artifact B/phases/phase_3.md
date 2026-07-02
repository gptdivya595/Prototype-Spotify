# Phase 3: Deterministic Retrieval, Novelty, and Diversity

## Objective

Turn the taste anchor, approved session intent, novelty setting, exclusions, and session history
into a reproducible set of 8–12 eligible tracks with transparent score components.

This phase tests the product mechanism without letting AI hide ranking mistakes.

## Preconditions

- Catalog and baseline pass Phase 1 validation.
- `ApprovedIntent` and direct-control behavior pass Phase 2.
- Novelty is explicitly defined relative to the selected profile and current session.
- Ranking version and seeded replay contracts are approved.

## In scope

1. Candidate eligibility and hard exclusions.
2. Intent relevance scoring from structured catalog attributes.
3. Requested-novelty fit.
4. Taste-anchor compatibility.
5. Incremental set-diversity contribution.
6. Repeat, rejection, and artist-cap penalties.
7. Seeded set selection and replay fixtures.
8. `/api/recommendations` without relying on explanation quality.
9. Diagnostic score output in development mode.

## Out of scope

- Learned ranking or model training.
- A vector database.
- LLM-based eligibility, novelty, or final score decisions.
- Long-term listening-history claims.
- Production-scale catalog retrieval.

## Ranking pipeline

```text
validated catalog
  → hard eligibility filters
  → per-track component scores
  → repeat/rejection/artist penalties
  → seeded sort
  → artist cap and incremental diversity selection
  → 8–12 ranked records
```

### Hard filters

Reject candidates intersecting approved artist, genre, or language exclusions. Reject invalid
catalog records at build time. No positive score can override a hard exclusion.

### Component score

Use the architecture default:

```text
0.45 × intent relevance
+ 0.25 × novelty fit
+ 0.20 × taste-anchor compatibility
+ 0.10 × set diversity contribution
− penalties
```

Document the exact calculation behind every component, including behavior when an intent field is
absent. Weights and formulas live in a versioned configuration module, not UI code.

### Novelty

Novelty is based only on evidence the prototype owns:

- artist absent from selected taste-anchor artists;
- distance from anchor genres/attributes using documented mappings;
- optional popularity tier when consistently sourced;
- whether the track or artist has already appeared in the session.

Use “new relative to your selected profile,” never “new to you.”

### Diversity and repetition

- Default maximum of two tracks per artist in a set.
- Suppress tracks already shown unless feedback explicitly requests a close follow-up.
- Prefer a different artist or genre when candidate scores are within the configured diversity
  margin.
- Track and expose unique-artist, unique-genre, and repeat-exposure diagnostics.

## Ranking fixtures

Create deterministic scenarios for:

- low-energy familiar-adjacent focus;
- adventurous discovery within one genre;
- genre widening while preserving language;
- an excluded artist with otherwise perfect relevance;
- an excluded language or genre;
- a very narrow constraint set with fewer than eight candidates;
- repeated-session exposure and rejection;
- identical scores requiring seeded tie-breaking;
- an anchor dominated by one artist/genre;
- no optional popularity metadata.

Each fixture includes expected eligible IDs, forbidden IDs, score bounds, artist caps, and
required explanation-independent diagnostics.

## Constraint-conflict behavior

If fewer than eight eligible tracks remain:

1. Do not silently ignore exclusions.
2. Return the candidate count and fields causing the conflict.
3. Suggest participant-controlled relaxation options.
4. Preserve all approved values until the participant changes one.
5. Log a safe structured diagnostic without raw intent.

## Deliverables

- Catalog repository and candidate-filter modules.
- Versioned scoring configuration and pure component functions.
- Seeded set selector with artist cap and diversity margin.
- `/api/recommendations` request/response contract.
- Development score-inspection view or structured debug output.
- Ranking replay command using redacted fixtures.
- Constraint-conflict UI contract.
- Ranking unit, property, contract, and fixture tests.
- Baseline parity test confirming both conditions use the same catalog/card count.

## Verification

### Automated

- Hard exclusions pass 100% of fixtures and property tests.
- The same inputs, catalog version, ranking version, and seed return the same set and order.
- Score components are finite and bounded; invalid values fail rather than coerce silently.
- Artist caps and repeat suppression hold across all normal fixtures.
- No selected track is absent from the deployed catalog.
- Baseline and guided responses share the same `RankedTrack` contract.
- Constraint conflicts return a stable recoverable error, not a server failure.
- Metric diagnostics match hand-calculated fixture outcomes.

### Human

- A PM can inspect a rejected and accepted candidate and understand every score component.
- A researcher can replay a session result from versioned inputs.
- Reviewers judge the ranking fixture sets directionally relevant enough to proceed to UI testing.
- Novelty labels are understood as relative to the selected prototype profile.

## Exit gate

Phase 3 is complete only when:

- all hard constraints and catalog-integrity tests pass;
- ranking is reproducible and replayable;
- normal study scenarios return 8–12 tracks without silent constraint relaxation;
- artist, diversity, and repeat controls measurably change the set;
- guided and baseline conditions differ only in the planned mechanism;
- no vector database or learned model is required to meet the fixture benchmark.

If results are directionally poor, improve catalog metadata or deterministic scoring before using
AI explanations. Explanation prose must not hide weak candidate selection.

## Handoff to Phase 4

Provide stable recommendation and feedback contracts, score diagnostics, novelty labels,
constraint-conflict states, ranking fixtures, and replay tooling. Phase 4 adds presentation and
grounded explanation without changing eligibility semantics.
