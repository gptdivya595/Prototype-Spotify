# Phase 1: Validate, Catalog, and Measure

## Objective

Confirm that current-session intent is worth testing, then establish the controlled catalog,
baseline, event vocabulary, and project foundation shared by both experiment conditions.

This phase prevents the team from building an elegant answer to the wrong problem. It also makes
later guided results comparable to a real baseline rather than a weaker straw-man experience.

## Starting evidence

- Discovery Evidence Lab found 266 discovery-related records in a complaint-enriched corpus.
- Leading themes were ignored taste (72), repetition (70), excessive similarity (50), popular or
  safe bias (49), stale Discover Weekly (48), and missing control (46).
- The inferred mechanism is a mismatch between persistent history and current intent.
- Public feedback does not prove that mechanism or show whether a setup step is acceptable.

## In scope

1. Five to six problem interviews with active discovery seekers.
2. Product and study assumptions log.
3. Next.js/TypeScript project foundation under `artifact-b/code`.
4. Versioned catalog schema and the first clean 300–500-track dataset.
5. Taste-anchor selection and unsteered baseline condition.
6. Session, condition-order, event, and metric contracts.
7. Local event adapter and deterministic test fixtures.

## Out of scope

- OpenAI integration.
- Free-text intent parsing.
- Novelty controls or iterative steering.
- AI explanations.
- Public participant study or production deployment.
- Spotify account, playlist, or playback integration.

## Workstream A: problem interviews

Recruit five to six people who intentionally seek unfamiliar music. Include at least one person
who is satisfied with Spotify discovery or prefers familiar music so the sample is not composed
only of complaints.

Use recent-behavior questions:

1. Walk through the last time you wanted something new.
2. What did you open first, and what happened?
3. What did “new” mean in that moment?
4. Was the failure relevance, repetition, shuffle behavior, catalog quality, or control?
5. How did you correct it or work around it?
6. Would you spend one short step declaring intent? What would feel like work?
7. Which single control would have helped most?

Record observations separately from interpretation. Do not present Discovery Compass before the
participant describes the latest real incident.

### Interview decision

| Outcome | Action |
|---|---|
| Current intent/control appears in at least four interviews | Continue with the proposed experiment |
| Playback/shuffle defects dominate | Pivot the prototype mechanism before Phase 2 |
| Base candidate quality dominates | Reframe around retrieval/catalog quality |
| Participants reject any setup and cannot name useful controls | Stop or test a zero-input concept |

The threshold is a product gate, not statistical proof.

## Workstream B: catalog foundation

Implement the `Track` contract from [architecture.md](../docs/architecture.md). Create a catalog
manifest with:

- catalog version and generation date;
- track count and unique-artist count;
- coverage by genre, language, mood, activity, energy band, and popularity tier;
- missing-field and duplicate counts;
- provenance for each metadata field;
- known coverage limitations.

Catalog rules:

- all track and artist names refer to real catalog entries;
- every record has a stable ID, source URL, description, and required arrays;
- energy uses one documented scale consistently;
- no inferred language, genre, mood, or popularity value is presented as verified without a
  documented method;
- a smaller valid catalog is preferred to filling 500 rows with fabricated attributes.

Create build-time validation that fails on duplicate IDs, invalid URLs, missing required fields,
unknown enum values, out-of-range numbers, or insufficient study coverage.

## Workstream C: experiment foundation

Implement:

- pseudonymous session creation;
- balanced baseline-first/guided-first order assignment;
- prepared taste anchors plus manual selection of 3–5 anchor items;
- baseline ranking from taste-anchor attributes with fixed diversity and repeat rules;
- the allowed `StudyEvent` envelope and event-specific property allowlists;
- local in-memory or JSONL event adapter;
- primary and guardrail metric functions over fixtures.

The baseline must use the same catalog, card count, and later card presentation as the guided
condition. It must be credible enough that the guided condition can lose.

## Deliverables

- Interview notes, synthesis, counterevidence, and explicit continue/pivot/stop decision.
- `artifact-b/code` project skeleton with lint, typecheck, test, and build commands.
- Validated `catalog.json` and `catalog.manifest.json`.
- Catalog coverage report and known limitations.
- Taste-anchor flow using prepared and manual options.
- Baseline recommendation service with a seeded result.
- Session assignment and event contracts.
- Metric unit tests using synthetic events.
- Architecture decision updates if interviews changed the mechanism.

## Verification

### Automated

- 100% of catalog records pass the schema.
- Track IDs are unique and source URLs use approved HTTPS origins.
- The same seed, catalog, anchor, and ranking version return the same ordered baseline.
- Assignment fixtures are balanced within one participant across the test set.
- Event allowlists reject names, emails, raw intent, and unknown properties.
- Metric fixtures produce hand-calculated accepted-novel-artist and acceptance rates.
- Typecheck, unit tests, production build, and dependency audit pass.

### Human

- A PM can explain why the interview evidence supports or changes the proposed mechanism.
- A researcher can create a taste anchor and receive a credible baseline set.
- A reviewer can inspect the catalog manifest and identify its coverage limitations.
- The baseline does not expose a novelty control or guided-intent feature.

## Exit gate

Phase 1 is complete only when:

- interviews support a documented experiment direction;
- the catalog is valid, versioned, and broad enough for the chosen study scenarios;
- the baseline is reproducible and not intentionally degraded;
- event and metric contracts can calculate the study outcome from synthetic data;
- no implementation depends on Spotify login, playback, or production recommendation APIs;
- unresolved decisions are recorded with an owner and required evidence.

If the mechanism changes, update the architecture and remaining phase plans before starting
Phase 2.

## Handoff to Phase 2

Provide the approved intent vocabulary, interview language examples, catalog enums, session
contract, event allowlist, and direct-control fallback requirements. Phase 2 may not expand the
catalog schema silently to accommodate model output.
