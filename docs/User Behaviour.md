# User Behaviour

## Core behavior loop

```text
Want something new
  → open Discover Weekly / radio / search / generated playlist
  → receive familiar, similar, or contextually wrong tracks
  → skip, retry, or abandon the surface
  → return to a known playlist or external discovery source
  → familiar listening strengthens the same profile
  → next discovery attempt starts from an even narrower loop
```

This loop is a hypothesis synthesized by Discovery Evidence Lab from public feedback. Interviews are required
to observe how often it happens and which step is most important.

## Jobs users are trying to complete

- Find music that is new **to me**, not merely new to the catalog.
- Stay recognisably close to my taste while stretching it by a chosen amount.
- Match discovery to what I want now: mood, activity, sound, genre, era, or energy.
- Prevent temporary listening contexts from permanently changing my recommendations.
- Explore without repeatedly encountering the same artists or tracks.
- Understand why a surprising recommendation may still be worth trying.

## Behaviors observed in the evidence

| Behavior | What it indicates |
|---|---|
| Large-playlist users repeatedly skip a small recurring subset | Library size does not guarantee experienced variety |
| Users build playlists around a “goal vibe,” then generated additions drift back to existing music | Session intent is not represented strongly enough |
| Users use private sessions or “exclude from taste profile” | They actively protect a persistent profile from context contamination |
| Users create new accounts to test a clean recommendation profile | They perceive their accumulated model as difficult to repair |
| Users seek music through friends, local shows, Reddit, Last.fm, Pandora, YouTube, or other tools | Discovery intent exists, but is completed outside Spotify |
| Users manually manage likes, dislikes, playlists, and artist pages | Good recommendations may require invisible training work |
| Some users consistently enjoy Discover Weekly, Release Radar, Daylist, or radio | The failure is heterogeneous; default algorithms work for some profiles |
| Some users prefer familiar music | Freshness should be controllable, not forced |

## Segment differences

### Active discovery seekers / power users

- Notice staleness and repeated artists quickly.
- Have enough listening history to recognise when only part of their taste is represented.
- Use workarounds and can explain desired controls.
- May have higher switching risk because discovery is a core reason they use the product.

### Explorers

- Want niche artists, genre movement, or unfamiliar sounds.
- Accept some misses if the system makes meaningful leaps.
- Need boundaries and guidance, not an undirected random list.

### Casual listeners

- Are underrepresented in complaint-focused Reddit evidence.
- May prefer familiar, low-effort recommendations.
- Should not be assumed to want aggressive discovery without interview evidence.

## Key tension: comfort versus exploration

The evidence does not support “always recommend unfamiliar music.” Users alternate between
comfort and exploration. The product problem is that Spotify must infer this state from history;
the user has no simple, visible way to declare it for the current session.

## Behavioral implications for Artifact B

1. Ask for one short **session intent**, not a long onboarding form.
2. Make freshness adjustable from familiar-adjacent to adventurous.
3. Show whether a recommendation is a new artist/genre relative to the prototype profile.
4. Let users exclude or down-rank a result and immediately regenerate.
5. Explain the connection to intent in one sentence.
6. Measure saves/shortlists, skips, refinements, and freshness acceptance—not audio plays.

See [Pain Point.md](Pain%20Point.md) for the ranked evidence and
[Artifact B Recommendation.md](Artifact%20B%20Recommendation.md) for the proposed experiment.
