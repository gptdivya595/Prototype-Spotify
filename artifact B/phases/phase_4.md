# Phase 4: Recommendation Experience and Immediate Steering

## Objective

Deliver the complete participant experience: taste anchor, guided intent, visible novelty,
recommendation cards, grounded explanations, direct feedback, immediate reranking, and clear
cause-and-effect.

The core outcome is not “chat works.” It is that a participant can steer a set and understand what
changed without learning the ranking architecture.

## Preconditions

- Phase 2 intent parsing and direct controls pass their usability gate.
- Phase 3 ranking, exclusions, replay, and constraint-conflict behavior pass.
- Card metadata and novelty labels come only from versioned catalog/ranking contracts.
- Explanation quality is not being used to compensate for poor candidate quality.

## In scope

1. Responsive study flow and condition progress.
2. Recommendation cards for 8–12 tracks.
3. Save, Not for me, More like this, and More adventurous actions.
4. Pure feedback reducer and immediate reranking.
5. Plain-language “what changed” messages.
6. Metadata-grounded AI explanations with deterministic fallback.
7. Keyboard, screen-reader, zoom, contrast, reduced-motion, mobile, and desktop behavior.
8. End-to-end events from anchor through condition survey.

## Out of scope

- Audio playback required for completion.
- Spotify visual cloning or account integration.
- Open-ended chatbot as the primary interface.
- Persistent user profiles, social sharing, or playlist publishing.
- Persuasive explanation claims not supported by catalog metadata.

## Participant flow

```text
study notice
  → taste anchor
  → assigned condition
  → guided intent + approval OR baseline start
  → 8–12 recommendation cards
  → save / reject / more like this / more adventurous
  → visible state change + reranked set
  → relevance, novelty, control, and explanation survey
  → second condition or completion
```

Keep the current condition, progress, and ability to recover visible. Do not reveal the experiment
hypothesis in a way that tells participants which condition should perform better.

## Recommendation card contract

Each card shows:

- track and artist;
- catalog genres/languages and a small number of relevant attributes;
- “new relative to your selected profile” when supported;
- one short grounded “why it fits” sentence in the guided condition;
- clear Save, Not for me, and More like this actions;
- accessible state after an action;
- optional source/preview link only when approved and not necessary for the task.

Card order and metadata are identical in structure across conditions. Avoid adding richer cards to
the guided condition because that would confound the mechanism test.

## Feedback reducer

Implement feedback as pure state transitions:

| Input | State update | Next-set behavior |
|---|---|---|
| Save | Mark track accepted | Keep study progress; do not automatically flood with same artist |
| Not for me | Add track rejection and bounded close-match penalty | Remove track and reduce close matches |
| More like this | Boost approved attributes within caps | Preserve variety while moving closer |
| More adventurous | Increase novelty by fixed step | Preserve other approved constraints |

After each action, show one factual message describing changed structured state. Do not generate
the state-change message with an LLM.

## Explanation service

The server selects tracks first. For each selected track, the AI sees only:

- selected track ID and approved metadata;
- approved session intent;
- allowed one-sentence output schema.

Reject outputs that change identity, add unsupported facts, claim knowledge of listening history,
or exceed the length bound. Use a deterministic template fallback, for example:

> Fits your low-energy focus request through its tagged calm mood and Hindi language; the artist
> is outside your selected profile.

The explanation should disappear or degrade gracefully when the service fails; recommendations
remain usable.

## Accessibility and responsive requirements

- Semantic headings, lists, forms, buttons, status regions, and condition progress.
- Visible focus with logical order; no keyboard trap.
- Action results announced without moving focus unexpectedly.
- Novelty is conveyed with text, not color alone.
- At 200% zoom and 320 CSS pixels, no horizontal page scroll or hidden primary action.
- Touch targets meet the selected accessibility standard.
- Motion is nonessential and respects reduced motion.
- Error text identifies the field and recovery action.
- Survey labels and scales have explicit accessible names.

## Deliverables

- Complete baseline and guided participant flows.
- Responsive recommendation cards and feedback states.
- `/api/feedback` route and pure reducer.
- Immediate reranking with deterministic change summaries.
- Grounded explanation service, validator, batching, and template fallback.
- Condition survey and study progress UI.
- Complete structured event emission.
- End-to-end test suite for both condition orders and failure modes.
- Accessibility checklist and resolved findings.
- Usability report from five participants.

## Verification

### Automated

- Both condition orders complete end to end.
- Every card maps to a real catalog record.
- Every accepted AI explanation references only approved track/intent fields or is replaced.
- Save/reject/refine events are emitted once with the correct condition and iteration.
- Feedback reranking preserves hard exclusions and ranking version.
- Keyboard flow reaches all actions and surveys.
- Narrow viewport and 200% zoom tests find no horizontal page overflow.
- Simulated AI failure still permits study completion.
- Client bundle and browser logs contain no OpenAI key.

### Human usability test

With five participants, verify that at least four can:

- create or choose a taste anchor;
- understand the assigned flow without coaching;
- approve/correct intent in the guided condition;
- explain the novelty control;
- reject or steer and identify what changed;
- finish both conditions and the survey.

Observe time to first accepted result and moments of uncertainty. Do not count facilitator rescue
as task success.

## Exit gate

Phase 4 is complete only when:

- the four-of-five usability threshold is met;
- all four feedback actions produce visible and testable changes;
- explanation failures do not block recommendations;
- the two conditions remain comparable and instrumentation-complete;
- keyboard, mobile, zoom, contrast, and reduced-motion checks pass;
- no secret, raw intent, or unsupported catalog fact is exposed.

## Handoff to Phase 5

Freeze a release candidate with catalog, ranking, prompt, model, event, and UI versions. Provide
the usability report, known issues, study script, test accounts/codes if used, and a clean test
event namespace. Phase 5 must not alter experiment mechanics during data collection.
