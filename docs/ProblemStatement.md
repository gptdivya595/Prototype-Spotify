# Problem Statement

## Status of this statement

This is the **leading problem hypothesis from Discovery Evidence Lab**, not a confirmed causal finding.
The Evidence Lab analysed 1,850 public feedback records and found a consistent problem pattern, but
5–6 interviews with the target segment are still required before Artifact B is treated as
validated.

## Problem framing narrative

**I am:** an active music listener with an established Spotify history who intentionally looks
for music beyond my current rotation.

- I use playlists, Discover Weekly, radio, Daylist, or Smart Shuffle.
- My taste changes by mood, context, genre, and life stage.
- I am willing to try unfamiliar music when it still feels relevant to what I want now.

**Trying to:** find genuinely new music that fits my current intent, without abandoning my taste
or spending significant effort on external sites.

**But:**

- recommendations often contain music I already know, overly similar tracks, or popular/safe
  choices;
- a large and varied listening history can collapse into a narrow recommendation profile;
- temporary contexts—children's music, a one-off genre, work playlists—can distort future
  recommendations;
- feedback and exclusion controls are hard to find, weak, or do not visibly change the result;
- exploration by genre/language and the reason behind a recommendation are limited.

**Because:** the system primarily infers a persistent taste profile from historical behavior,
while the listener has little way to express **session intent**, desired novelty, unwanted
influences, or how far they want to move outside their comfort zone. The resulting feedback loop
keeps rewarding familiar engagement and becomes slower than the listener's changing intent.

**Which makes me feel:** bored, frustrated, ignored, and trapped in a listening loop; some users
report doing discovery elsewhere or considering another service.

## Evidence behind the hypothesis

The Evidence Lab's final corpus contains **1,850 records**: 100 App Store reviews, 1,200 Play Store
reviews, and 550 Reddit posts/comments from seven recommendation/discovery discussions.
After enrichment and conservative removal of ads/playback false positives, **266 records** were
classified as discovery-related.

| Discovery frustration | Tagged records |
|---|---:|
| Recommendations ignore taste | 72 |
| Repetitive recommendations | 70 |
| Recommendations are too similar | 50 |
| Algorithm pushes popular/safe music | 49 |
| Stale Discover Weekly | 48 |
| No control over recommendations | 46 |
| Poor genre exploration | 19 |
| Autoplay/repetition loop | 14 |
| Hard to find new artists | 14 |
| Discovery UI friction | 10 |
| No explanation | 6 |

Counts are multi-label and describe this purposefully sampled public-feedback corpus—not all
Spotify listeners.

## Counter-evidence and alternative explanations

The problem is not universal. Several Reddit contributors report that Discover Weekly, Release
Radar, Daylist, or artist radio work well when they provide varied inputs and deliberately manage
their taste profile. This counter-evidence matters:

- it weakens the claim that Spotify's recommendation algorithm is simply “bad” for everyone;
- it suggests a **user-model/intent mismatch** rather than only insufficient model quality;
- it shows that people can improve results, but the required behavior is hidden and high-effort;
- some repetition comes from shuffle/playback behavior, which is adjacent to—but distinct from—
  discovery recommendations.

## Context and constraints

- Public reviews and complaint-focused Reddit threads are self-selected and skew negative.
- Segment labels are inferred from text; they are not verified demographics.
- Language exploration is an opportunity signal, but current qualitative evidence is stronger
  for genre exploration than multilingual exploration.
- Artifact B will use a small curated music JSON catalog, no Spotify API, and no audio playback.
- The MVP must demonstrate AI value through intent understanding, refinement, and explanation—not
  by claiming to replace Spotify's production recommender.

## Final problem statement

> Active discovery seekers need a low-effort way to express what “new, but right for me now”
> means because a history-driven recommendation profile cannot reliably capture changing session
> intent or unwanted influences, which leaves them frustrated and returning to familiar music.

## Why solving it matters

For users, success means less effort, more relevant novelty, and greater trust when leaving a
familiar playlist. For Spotify, the opportunity is to increase discovery breadth and reduce the
stale-product/churn signal without discarding the strengths of the existing recommendation
system.

## What interviews must validate

1. Do active discovery seekers recognise this statement in their own behavior?
2. Is the primary failure missing session intent, poor base recommendations, shuffle repetition,
   or something else?
3. Which control is most valuable: novelty, exclusions, genre/language, mood/context, or source?
4. Would users spend one short step declaring intent before receiving recommendations?
5. Does an explanation change trust or only decorate a bad recommendation?
6. What would cause a user to save/play a new artist rather than return to a familiar playlist?

Only after these interviews should the Artifact B hypothesis in
[Artifact B Recommendation.md](Artifact%20B%20Recommendation.md) be locked.
