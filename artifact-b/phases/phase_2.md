# Phase 2: Intent Layer and Editable Interpretation

## Objective

Let participants express current intent in natural language, convert it into the approved schema,
and make every interpretation visible and correctable before recommendation generation.

The AI is successful only if it reduces expression effort without hiding product state. Direct
controls remain a complete fallback.

## Preconditions

- Phase 1 produced a continue or documented pivot decision.
- The catalog vocabulary and `ApprovedIntent` schema are versioned.
- Taste anchors, sessions, event allowlists, and the baseline are working.
- The project has server-only environment handling for `OPENAI_API_KEY` and `DEFAULT_MODEL`.

## In scope

1. Intent-entry UI with examples and a clear purpose statement.
2. Server-only OpenAI adapter.
3. Strict structured-output validation.
4. Editable chips/fields for activity, mood, genre, language, energy, novelty, and exclusions.
5. Ambiguity, unknown-term, timeout, and model-unavailable states.
6. Golden intent evaluation and prompt-injection fixtures.
7. Privacy-safe events for parse result shape, edits, latency, and failure reason.

## Out of scope

- Track selection or AI-generated track IDs.
- Final recommendation ranking.
- Recommendation explanations.
- Long conversational memory.
- Persisting raw intent text in analytics or server logs.

## Experience contract

The guided condition follows this sequence:

1. Participant sees one short prompt and optional examples.
2. Participant submits a bounded current-intent sentence.
3. Server returns a candidate `ApprovedIntent` plus unresolved terms.
4. UI displays all interpreted fields in plain language.
5. Participant edits or approves the interpretation.
6. Only the approved structure is passed to ranking in Phase 3.

The UI must never imply that model output is a hidden recommendation profile. It describes the
current session only.

## Server tasks

- Add `/api/intent/parse` with request-size, session, rate, and schema validation.
- Create a provider interface so model calls can be mocked and model names can change through
  configuration without rewriting the route.
- Send only current-intent text, allowed vocabularies, output schema, and bounded instructions.
- Treat participant text as untrusted data; reject attempts to change system behavior.
- Validate unknown fields, enum values, arrays, numeric ranges, and maximum list lengths.
- Return unresolved terms instead of forcing unsupported values into the schema.
- Supply deterministic defaults or direct-control mode when the call fails.
- Remove raw intent and provider payloads from normal logs and analytics.

## Client tasks

- Add example intents that reflect the chosen catalog coverage, not impossible breadth.
- Make the AI interpretation visually distinct from participant-approved values.
- Allow editing with keyboard-accessible controls.
- Explain novelty relative to the selected taste anchor.
- Show unsupported terms and a path to remove or replace them.
- Preserve participant edits when a retry occurs.
- Provide a “Set preferences manually” path before and after an AI failure.

## Golden evaluation set

Create 25–40 human-reviewed phrases covering:

- mood/activity combinations;
- genre and language constraints;
- familiar versus adventurous language;
- artist, genre, and language exclusions;
- negation such as “not acoustic”;
- refinement language such as “less dreamy, more rhythmic”;
- ambiguous or contradictory requests;
- unsupported genres/languages;
- empty, very short, and overlong input;
- mixed-language phrasing;
- prompt-injection attempts and requests for secrets.

For each fixture, store acceptable structured interpretations, required exclusions, forbidden
values, unresolved terms, and whether direct clarification is expected.

## Deliverables

- Intent-entry and editable-interpretation UI.
- OpenAI provider adapter and deterministic mock.
- Validated `/api/intent/parse` route.
- Direct-control fallback covering every approved field.
- Golden intent dataset and evaluation command.
- Parser latency, schema failure, unresolved-term, and edit events.
- Error copy for timeout, rate limit, unsupported term, and provider outage.
- Short privacy note stating that raw intent is used for parsing but not retained in study events.

## Verification

### Automated

- 100% of model responses either pass the schema or enter a safe fallback; invalid structures
  never reach session state.
- Every golden case preserves required negation/exclusion behavior.
- Prompt-injection fixtures cannot produce track IDs, secret fields, HTML, or schema expansion.
- Inputs over the size limit are rejected before an AI call.
- Provider mock covers success, timeout, malformed output, rate limit, and outage.
- Raw intent does not appear in study event fixtures or normal structured logs.

### Human

- At least four of five usability participants can explain what the AI interpreted.
- At least four of five can correct one deliberately wrong field without assistance.
- Participants understand that changes apply to the current session, not their Spotify account.
- A participant can complete the same task through direct controls after a simulated AI outage.

## Exit gate

Phase 2 is complete only when:

- the golden set has no structural or hard-exclusion failures;
- semantic disagreements are documented and do not silently create unsupported catalog values;
- the interpretation is editable, accessible, and approved before ranking;
- the model cannot choose tracks or bypass deterministic controls;
- rate, latency, failure, and estimated cost per parse are visible;
- usability evidence meets the four-of-five comprehension and correction threshold.

## Handoff to Phase 3

Provide versioned `ApprovedIntent` fixtures, approved participant edits, unresolved-term behavior,
novelty definitions, and parser failure states. Phase 3 consumes only approved structured intent,
never raw participant text.
