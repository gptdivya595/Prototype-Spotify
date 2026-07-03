# Discovery Compass Implementation Status

Verified locally on 2 July 2026.

## Summary

The five technical phases are implemented as a working local prototype. Artifact B is **not yet
study-ready** because the human interviews, full catalog, hosted database configuration, formal
usability test, and paired participant evaluation remain open.

| Phase | Technical status | Validation evidence | Open gate |
|---|---|---|---|
| 1. Catalog and measurement | Implemented | Validated seed catalog, deterministic baseline, assignments, event allowlist, metric tests | 5–6 interviews; expand 50 tracks/40 artists to study catalog |
| 2. Intent layer | Implemented | Strict schema, vocabulary filtering, deterministic fallback, prompt-injection tests, editable UI | Human golden-set review; live call with rotated key |
| 3. Ranking | Implemented | Hard exclusions, novelty, diversity, repeat penalties, artist caps, replay tests | Human relevance review on expanded catalog |
| 4. Experience | Implemented | Guided/baseline UI, grounded explanations, feedback reducer, reranking, responsive browser flow | Five-person usability test and accessibility audit |
| 5. Evaluate and deploy | Implemented as infrastructure | Structured surveys/events, Neon adapter, readiness health, analysis command, Vercel config | Database credentials, deployment, and ten paired sessions |

## Verified behavior

- Seed catalog: 50 tracks, 40 artists, 40 genre labels, 5 languages.
- Catalog schema and duplicate checks pass.
- Baseline and guided ranking are seeded and deterministic.
- Hard artist, genre, and language exclusions cannot be outscored.
- Recommendation sets enforce a two-track-per-artist cap.
- OpenAI output is constrained to intent/explanation schemas and server-only routes.
- Missing or invalid AI output falls back to direct parsing and catalog-grounded templates.
- Rejection reranks immediately and suppresses the rejected track in the verified flow.
- Event allowlists reject identity, IP, prompt, intent-text, secret, and API-key properties.
- Desktop and 390px mobile browser checks found no horizontal overflow.
- Production dependency audit reports zero vulnerabilities.

## Honest readiness states

### Technical prototype ready

The app can be demonstrated locally without external services.

### Preview ready after configuration

A Vercel preview can run with memory events and deterministic AI fallbacks. It is useful for
review, not participant evaluation.

### Evaluation not ready

`/api/health` must continue to report `evaluationReady: false` until interviews, catalog, durable
event storage, and a rotated key are configured. Formal study outcomes do not exist yet.

## Next actions

1. Run 5–6 problem interviews and update the scope if current-session intent is not supported.
2. Expand the catalog to 300–500 reviewed tracks and at least 120 artists.
3. Review the 25 intent fixtures and add human-approved expected outputs.
4. Configure a Neon evaluation database and event-retention policy.
5. Run a five-person usability test.
6. Freeze versions, deploy, and run at least ten counterbalanced paired sessions.
