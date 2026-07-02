# Phase 5: Evaluate, Deploy, and Decide

## Objective

Deploy a stable evaluation build, run the paired directional study, verify data quality, and make
an explicit continue, iterate, pivot, or stop decision from observed evidence.

Deployment is not the outcome. The outcome is a credible product decision about the session-intent
and steering mechanism.

## Preconditions

- Phase 4 release candidate passes automated, accessibility, and usability gates.
- Catalog, ranking, prompt, model, event, and UI versions are frozen for the study.
- A durable hosted event store and retention policy are ready.
- Study notice, facilitation script, participant criteria, and analysis template are approved.
- Test events are isolated from real evaluation events.

## In scope

1. Vercel preview and evaluation environments.
2. Durable event adapter and data-quality checks.
3. Security, privacy, cost, performance, and failure-mode hardening.
4. At least ten completed paired sessions with counterbalanced order.
5. Qualitative debrief and structured survey.
6. Primary, guardrail, and diagnostic metric analysis.
7. Decision report and next-step recommendation.

## Out of scope

- Statistical claims from a small directional sample.
- Changing ranking weights, prompts, catalog, or UI during data collection.
- Generalizing results to all Spotify listeners.
- Production launch, Spotify integration, or long-term retention claims.

## Deployment work

- Create separate Vercel preview and evaluation configurations.
- Configure server-only `OPENAI_API_KEY`, `DEFAULT_MODEL`, event database credentials, and study
  version variables.
- Use an isolated preview/test event namespace.
- Fail evaluation readiness when the durable event store is missing.
- Add health checks for catalog count/version, ranking version, event store, and model
  configuration without exposing values that are secret.
- Apply rate limits, request-size bounds, security headers, and a per-session AI budget.
- Verify direct navigation, refresh recovery, mobile layout, and both condition orders.

## Data-quality rehearsal

Before recruiting participants, complete at least three synthetic sessions:

1. baseline then guided with saves and a refinement;
2. guided then baseline with rejection and more adventurous;
3. parser outage and explanation fallback.

For each rehearsal, confirm:

- exactly one session start and completion;
- both condition completions with the assigned order;
- recommendation impressions before acceptance events;
- no duplicate events after refresh/retry;
- metric denominators match cards actually shown;
- no raw intent, identity, secret, or full IP address in stored data;
- replay versions are present and consistent;
- incomplete sessions are distinguishable from valid completions.

Delete or permanently mark rehearsal data before participant analysis.

## Study design

Run at least ten completed paired sessions. Counterbalance condition order. Use the same taste
anchor and catalog within a participant's two conditions.

### Tasks

1. Select or build the taste anchor.
2. Complete the first assigned discovery condition.
3. Save/shortlist acceptable recommendations and use available controls naturally.
4. Rate relevance, novelty, control, and effort.
5. Complete the second condition with the same anchor.
6. Repeat ratings and complete a short comparative debrief.

Do not prompt participants to prefer unfamiliar artists. Ask what they would genuinely save for
later listening.

### Debrief prompts

- Which set better matched what you wanted in the moment, and why?
- Which recommendations felt new but still appropriate?
- Did any control change the set in a way you could understand?
- What felt like work?
- Did the explanation help, add noise, or merely restate metadata?
- What would make you use or avoid this before a listening session?

## Analysis

### Primary

Compare accepted novel artist rate between guided and baseline conditions within participants.
Report raw numerators/denominators and participant-level paired differences. Do not report a
streaming or retention effect.

### Guardrails

- overall card acceptance;
- perceived relevance;
- time/actions to first accepted result;
- completion and abandonment;
- setup effort.

### Diagnostics

- first-set versus post-refinement acceptance;
- unique artist and genre ratios;
- repeat exposure rate;
- intent edit rate and fields edited;
- parser failure/fallback;
- explanation helpfulness;
- perceived control and ability to describe what changed;
- cost and latency per completed guided condition.

Segment findings cautiously. Ten sessions do not support reliable demographic or behavioral
subgroup conclusions.

## Decision rubric

### Continue

- Guided accepted-novel-artist rate improves directionally for most participants.
- Overall acceptance and relevance do not show a meaningful negative pattern.
- Participants can explain how intent/feedback changed the set.
- Setup effort is acceptable and no recurring privacy or reliability concern appears.

Next step: expand catalog coverage and run a larger validation, not immediate Spotify integration.

### Iterate

- Participants value the control mechanism, but parser, catalog, ranking, or UI failures are
  identifiable and repairable.
- Improvement occurs mainly after refinement, indicating first-set interpretation needs work.

Next step: fix the isolated mechanism and repeat the paired study with a new frozen version.

### Pivot

- Playback/shuffle behavior or base candidate quality dominates outcomes.
- Participants want direct controls but not free-text intent.
- A different problem mechanism consistently appears in debriefs.

Next step: update the problem statement and architecture before building more features.

### Stop

- Guided results are not distinguishable or reduce relevance.
- Setup feels like work without compensating value.
- Participants do not understand or use steering, even after usability fixes.

Record the stopped hypothesis and reusable learning; do not reinterpret weak results as success.

## Deliverables

- Public evaluation URL and deployment runbook.
- Passing production health and smoke checks.
- Data dictionary, retention policy, and clean evaluation dataset.
- Data-quality rehearsal report.
- At least ten valid paired session records or a documented recruitment blocker.
- Analysis notebook/script with reproducible metric calculations.
- Qualitative synthesis with counterevidence and representative source notes.
- Cost, latency, failure, accessibility, and security summary.
- Final continue/iterate/pivot/stop decision memo.
- Prioritized next-phase recommendation tied to observed evidence.

## Verification

### Technical

- Production build, unit, contract, golden, and end-to-end suites pass.
- Evaluation environment uses durable event storage.
- Health endpoint is ready and reveals no secrets.
- Both condition orders pass desktop and mobile smoke tests.
- Event replay reproduces metric inputs for sampled sessions.
- No OpenAI key or database credential appears in client assets, responses, logs, or events.
- Per-session cost and latency stay within the documented study budget.

### Research

- Inclusion/exclusion rules for valid sessions are applied before examining outcomes.
- Every metric has a verified numerator and denominator.
- Baseline and guided versions remain frozen across included sessions.
- Incomplete and rehearsal sessions are excluded transparently.
- The report distinguishes observation, participant statement, inference, and recommendation.
- Counterevidence and negative outcomes remain visible.

## Exit gate

Artifact B is complete when:

- the evaluation build is reproducible and publicly reachable;
- at least ten valid paired sessions have been analysed, or a genuine external recruitment
  blocker is documented without claiming experiment success;
- primary and guardrail results are reproducible from the allowed event data;
- qualitative findings explain the likely mechanism and major failure modes;
- an explicit continue, iterate, pivot, or stop decision is signed off;
- next work is scoped from Artifact B evidence rather than the original Artifact A assumption.

## Final handoff

Archive the frozen code version, catalog manifest, ranking configuration, prompts, model name,
event schema, evaluation dataset, analysis script, and decision report together. The next team
must be able to reproduce what participants saw and why the product decision was made.
