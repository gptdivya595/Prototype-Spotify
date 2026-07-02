# Solutioning: From Discovery Evidence Lab to Artifact B

## Naming

- **Discovery Evidence Lab** is the research product delivered as Artifact A.
- **Solutioning** is this evidence-to-decision process, not the product name.
- **Discovery Compass** is the recommended Artifact B prototype.

## Decision

Build **Discovery Compass**, an intent-guided discovery session for active music explorers. It
should help a listener say what fits the present moment, choose how unfamiliar the result may
be, exclude unwanted directions, and immediately steer the next set.

The detailed product requirements, ranking design, experiment, and delivery phases live in
[Artifact B Recommendation.md](Artifact%20B%20Recommendation.md). This document explains why that
solution follows from Discovery Evidence Lab.

## Evidence-to-solution chain

```text
Persistent listening history
        +
current mood, activity, genre, and novelty intent are weak or invisible
        ↓
familiar, similar, or popular recommendations dominate
        ↓
listener cannot easily correct, exclude, or reset the direction
        ↓
skipping, manual playlist work, external discovery, or familiar fallback
        ↓
the same persistent profile receives more familiar behavior
```

Discovery Evidence Lab supports this loop as a **problem hypothesis**, not a proven model of Spotify's
internal algorithm. The strongest corpus themes are ignored taste (72), repetition (70),
overly similar recommendations (50), popular or safe bias (49), stale Discover Weekly (48), and
missing control (46).

## Why this solution addresses the problem

| Evidence-backed problem | Discovery Compass response | What the prototype tests |
|---|---|---|
| A historical profile misses current intent | One short natural-language session intent | Whether users can express “right for me now” with low effort |
| Familiar and similar tracks dominate | Familiar-to-adventurous novelty control | Whether controlled novelty raises accepted new-artist results |
| Temporary contexts contaminate recommendations | Artist, genre, language, and context exclusions | Whether removing unwanted directions improves relevance |
| Users cannot see if feedback changed anything | Immediate reranking plus a visible change summary | Whether cause-and-effect increases perceived control |
| Large libraries still feel repetitive | Repeat penalties, artist caps, and diversity scoring | Whether experienced variety improves, independent of catalog size |
| Surprising results can feel arbitrary | One short metadata-grounded “why this fits” explanation | Whether explanation helps after relevance is adequate |

The solution does not promise to repair Smart Shuffle itself. Smart Shuffle evidence reinforces
the broader need for visible control, repeat suppression, and reliable state. Artifact B tests
those interaction principles over a small curated catalog.

## Why AI is appropriate

AI earns a narrow role where user language is flexible:

- translate “warm Hindi indie for late-night focus, mostly unfamiliar” into editable constraints;
- interpret refinement such as “less dreamy, more rhythmic”;
- produce a short explanation using only the selected track's catalog metadata and the approved
  intent.

AI should not enforce exclusions, calculate novelty, choose experiment conditions, invent track
facts, or determine success metrics. Those responsibilities remain deterministic and testable.

## Why not the obvious alternatives

### Not a generic music chatbot

A chat window alone does not guarantee diversity, repeat suppression, or visible control. The
core experience needs direct controls and recommendation cards; conversation is a refinement
path.

### Not a replacement recommendation model

Discovery Evidence Lab contains counterevidence from users who value Discover Weekly, Release Radar, and
Daylist. The experiment should augment an existing taste anchor rather than claim personalization
is universally broken.

### Not only a novelty slider

Novelty does not capture mood, activity, language, genre, or exclusions. A slider is useful only
when combined with current intent and immediate steering.

### Not a Smart Shuffle clone or fix

The corpus mixes discovery, shuffle, and playback complaints. Rebuilding shuffle would test a
different problem and would require playback behavior that the prototype does not need.

### Not multilingual-first positioning

The catalog can support languages, but current evidence is stronger for genre breadth than
language discovery. Interviews must validate multilingual positioning.

## Minimum experiment

1. Use a curated JSON catalog of 300–500 consistently tagged tracks.
2. Let a participant select 3–5 taste anchors.
3. Compare an unsteered baseline with an intent-guided condition.
4. In the guided condition, allow intent, novelty, exclusions, and immediate feedback.
5. Return 8–12 tracks with factual one-sentence explanations.
6. Measure accepted novel artist rate, overall acceptance, refinement success, repeat exposure,
   time to first accepted result, and perceived relevance/control.

## Decision gates

| Gate | Evidence required |
|---|---|
| Problem validation | 5–6 interviews recognize the intent/profile mismatch in recent behavior |
| Usability | At least 4 of 5 participants can set intent, understand novelty, and refine unaided |
| Directional value | Guided sessions improve accepted novel-artist rate without lowering relevance |
| Continue | Users understand how their input changed the set and value the control |
| Pivot | Playback defects or base-candidate quality dominate the failure |
| Stop | Setup feels like work and guided results are not meaningfully different |

## Product-manager recommendation

Proceed to interviews and a bounded prototype, not a production integration. Discovery Compass
is the smallest coherent experiment that tests the Evidence Lab's leading mechanism while preserving
counterevidence and making failure measurable.
