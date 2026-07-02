# User Segmentation

## Important limitation

Discovery Evidence Lab infers behavior segments from review language; it does not know the reviewer's actual
usage frequency, demographics, or library size unless they state it. These labels are useful for
interview recruitment hypotheses, not market sizing.

## Final inferred distribution

Among 266 discovery-related records:

| Inferred segment | Records | Interpretation |
|---|---:|---|
| Power user | 184 | Long tenure, deep library, named discovery surfaces, active profile management |
| Unknown | 37 | Insufficient behavioral evidence |
| Casual | 22 | Lower-effort/lean-back language inferred by the classifier |
| Explorer | 18 | Explicit desire to broaden genres/artists |
| Mood-based | 5 | Discovery framed around mood/activity |

The power-user count is partly a source effect: long-form, complaint-focused Reddit threads
contain more detailed behavior signals than short store reviews.

## Recommended interview segment

### Primary: active discovery seekers with established histories

Recruit people who:

- have used Spotify for at least two years;
- intentionally use Discover Weekly, radio, Daylist, Release Radar, Smart Shuffle, or search to
  find music;
- maintain several playlists or a large liked-song library;
- can recall a recent failed discovery attempt;
- have used a workaround such as external recommendations, private sessions, exclusions, or
  manual profile management.

This observable recruitment definition is stronger than relying on the LLM label “power user.”

### Contrast participants

Include one or two users who say Spotify discovery works well. They help identify successful
inputs, listening patterns, and expectations—and protect the research from interviewing only
complainers.

### Defer as primary targets

- Casual listeners: current evidence is too thin to define their problem confidently.
- Multilingual explorers: strategically interesting but not yet supported by enough direct
  qualitative evidence.
- Mood-only listeners: only five inferred records.

## Interview recruitment matrix

| Participant | Discovery outcome | Tenure/library | Purpose |
|---|---|---|---|
| 1–2 | Repeatedly stale | Long/deep | Understand the failure loop |
| 3 | Context contamination | Any | Test exclusions/profile repair |
| 4 | Genre explorer | Established | Test novelty boundaries |
| 5 | Switched/uses external tools | Long/deep | Understand churn/workarounds |
| 6 | Discovery works well | Long/deep | Counterexample and successful behavior |

## Decision

Artifact B should be designed for the **active discovery seeker**, while the interview sample
must include positive counterexamples. Do not claim the segment is validated until those
interviews are completed.
