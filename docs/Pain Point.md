# Pain Points — Discovery Evidence Lab Synthesis

## How the pains were derived

1. Collected 1,850 unique public feedback records across App Store, Play Store, and seven
   manually saved Reddit threads.
2. Classified every record with a constrained LLM schema.
3. Removed obvious ads, payment, queue, download, and playback-only false positives unless the
   text also contained an explicit discovery/recommendation signal.
4. Aggregated the full 266-record discovery subset for prevalence.
5. Used RAG only for qualitative explanation and citations—not to estimate frequency.
6. Ran 15 research questions and a 9-case retrieval evaluation.

## Ranked discovery pains

| Rank | Pain | Count | Interpretation |
|---:|---|---:|---|
| 1 | Recommendations ignore taste | 72 | Current suggestions conflict with known or changing preferences |
| 2 | Repetitive recommendations | 70 | Familiar tracks recur across discovery surfaces |
| 3 | Recommendations are too similar | 50 | Variety stays inside a narrow cluster |
| 4 | Algorithm pushes popular/safe music | 49 | Mainstream/familiar choices crowd out long-tail discovery |
| 5 | Stale Discover Weekly | 48 | A flagship discovery surface loses novelty over time |
| 6 | No control over recommendations | 46 | Users cannot steer, exclude, reset, or separate contexts |
| 7 | Poor genre exploration | 19 | Moving deliberately across genres is difficult |
| 8 | Autoplay/repetition loop | 14 | Playback behavior reinforces the same rotation |
| 9 | Hard to find new artists | 14 | Emerging or unfamiliar artists are difficult to surface |
| 10 | Discovery UI friction | 10 | Discovery paths are buried or difficult to navigate |
| 11 | No explanation | 6 | Users cannot understand why a recommendation appeared |

Counts are multi-label and use 266 discovery-related records as the denominator. The source
sample is intentionally enriched for complaints, so these numbers rank problems inside this
corpus; they are not population prevalence.

## The problem pattern

```text
Historical behavior + engagement optimization
                    ↓
       compressed persistent taste profile
                    ↓
 current mood/context/novelty intent is missing
                    ↓
 familiar + similar + popular recommendations
                    ↓
 user cannot easily steer, exclude, or reset
                    ↓
 skips / familiar playlists / external discovery
                    ↓
 more familiar history enters the profile
```

### Leading causal hypothesis

The strongest combined explanation is an **intent–profile mismatch**: a history-driven model is
trying to predict what a listener will accept, while the listener is asking for a context-specific
kind of novelty. Weak steering and exclusion controls allow that mismatch to become a
self-reinforcing loop.

“No control” is therefore important, but it is not the sole or highest-frequency pain. It is the
missing corrective mechanism around the larger taste/repetition problem.

## Strong qualitative signals

- A user with a 4,000-song library reports hearing roughly the same 100 tracks and spending more
  time skipping than listening.
- Users say radio and generated playlists bring them back to tracks they already play.
- Users explicitly request a setting to choose familiar music versus “pure discovery.”
- Parents describe children's music contaminating their long-term taste profile and ask for a
  way to forget songs, albums, or genres.
- Long-tenured users experiment with new accounts, private sessions, external tools, or competing
  services to escape a stale profile.
- Some users report excellent discovery after carefully varying inputs and managing profile
  signals—important counter-evidence that the failure is not universal.

## What users are actually asking for

| User need | Evidence strength | MVP implication |
|---|---|---|
| Choose familiarity versus novelty | Strong | One visible novelty control |
| Express current mood/intent/vibe | Strong | Natural-language session intent |
| Exclude unwanted profile influences | Strong | Avoid artists/genres/contexts and remember feedback |
| Receive genuinely unfamiliar choices | Strong | Known-item/artist suppression and novelty indicator |
| Explore beyond one narrow genre cluster | Moderate | Genre/language boundaries and cross-genre option |
| Understand why a recommendation fits | Weak–moderate | Short explanation, tested as a trust hypothesis |

## Out of scope for Artifact B

- Fixing Spotify shuffle infrastructure.
- Ads, pricing, queueing, downloads, and general app performance.
- Rebuilding Spotify's production recommender.
- Claiming language discovery is the primary pain before interviews validate it.

## Product implication

Artifact B should test whether **explicit session intent plus lightweight steering** produces
more accepted novelty than an unsteered recommendation list. The recommended MVP is described in
[Artifact B Recommendation.md](Artifact%20B%20Recommendation.md).
