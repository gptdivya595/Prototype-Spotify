# RAG Question Bank and Answers

## What this document contains

These answers came from Discovery Evidence Lab's grounded RAG workflow on 2 July 2026. The final index
contains **266 discovery-related records** selected from 1,850 App Store, Play Store, and Reddit
records. RAG retrieved qualitative evidence and generated cited answers. Deterministic corpus
aggregation supplied all counts and prevalence statements.

The complete machine-generated bundle is written to
`artifact A/code/data/research-answers.json` by `npm run research`. The attached UI exports and
terminal answers were reviewed when preparing this document.

### Reconciliation rule

Some attached generated answers repeated older aggregate values such as 78 ignored-taste
mentions or 53 missing-control mentions. Those values are not used here. The final audited
totals are:

| Theme | Final count |
|---|---:|
| Recommendations ignore taste | 72 |
| Repetitive recommendations | 70 |
| Recommendations are too similar | 50 |
| Algorithm pushes popular or safe music | 49 |
| Stale Discover Weekly | 48 |
| No control over recommendations | 46 |
| Poor genre exploration | 19 |
| Autoplay loop | 14 |
| Hard to find new artists | 14 |
| UI friction | 10 |
| No explanation | 6 |

Counts are multi-label and describe this purposefully sampled corpus, not Spotify's user base.

## Six core questions

### 1. Why do users struggle to discover new music?

**RAG answer:** users describe a combination of recommendations that miss their current taste,
repeat familiar tracks, stay inside narrow similarity clusters, favor popular music, and offer
few effective correction controls. Radio and generated playlists often lead back to music the
listener already knows. Discover Weekly can become stale, while new artists and user-created
discovery paths are harder to find.

**Evidence returned:** six to eight cited records across the attached runs, mainly Reddit plus
supporting store evidence. The answer consistently retrieved taste mismatch, repetition,
popularity bias, control, and new-artist discovery themes.

**PM interpretation:** the evidence supports an intent-to-profile mismatch hypothesis. It does
not prove how Spotify's production algorithm works or why it optimizes a given result.

### 2. What are the most common recommendation frustrations?

**RAG answer:** the generated responses emphasized ignored taste, repeated songs, popular or
safe recommendations, stale playlists, and missing controls. The final full-corpus ranking is
the deterministic table above, with ignored taste (72) and repetition (70) leading.

**Evidence returned:** six to nine cited records across Reddit and Play Store. Retrieved examples
describe the same songs appearing across playlists, Discover Weekly surfacing already-known
music, and recommendations that conflict with established preferences.

**PM interpretation:** RAG explains the themes; it must not estimate which one is most common.
Theme ordering comes from all 266 classified discovery records.

### 3. What listening behaviors are users trying to achieve?

**RAG answer:** users want to balance purposeful freshness with recognizable relevance. They use
private sessions, “exclude from taste profile,” manual playlists, external tools, friends,
Shazam, artist pages, and live shows to protect or supplement their Spotify profile. Some users
also value familiarity, so aggressive freshness should not be forced.

**Evidence returned:** seven to eight citations. The answer included both complaint evidence and
counterevidence from users who improve results through careful input management.

**PM interpretation:** the job is not “always play unknown music.” It is “let me decide what new
and relevant mean for this session.”

### 4. What causes users to repeatedly listen to the same content?

**RAG answer:** users say familiar tracks reappear across daily mixes, radio, generated
playlists, shuffle, and Smart Shuffle. Failed discovery attempts lead to skipping or returning
to known playlists, which adds more familiar listening history. Users also acknowledge that
familiar songs can create stronger emotional reactions, so not all repetition is unwanted.

**Evidence returned:** five citations in both attached runs. Evidence covered repeated exposure,
small recurring artist sets, lack of correction control, and familiarity as a competing
explanation.

**PM interpretation:** the feedback-loop explanation is a hypothesis. Interviews should separate
recommendation repetition, playback/shuffle defects, and intentional comfort listening.

### 5. Which user segments experience different discovery challenges?

**RAG answer:** inferred power users describe stale profiles, repetition despite large
libraries, narrow genre representation, and extensive workarounds. Explorer records focus on
niche artists and broader genre movement. Casual and mood-based listeners have too little
evidence for confident comparison.

| Inferred segment | Records |
|---|---:|
| Power user | 184 |
| Unknown | 37 |
| Casual | 22 |
| Explorer | 18 |
| Mood-based | 5 |

**Evidence returned:** four to five citations. The generated answer also correctly warned that
casual and mood-based evidence was insufficient.

**PM interpretation:** these are model-inferred behavioral labels, not verified personas or
demographics. Primary interviews must recruit real people and reassess the segments.

### 6. What unmet needs emerge consistently across reviews?

**RAG answer:** relevant freshness, less repetition, profile repair, exclusions, session-level
steering, broader genre exploration, and easier access to new artists. Explanations appear as a
supporting need, but only six records received the explicit `no_explanation` tag.

**Evidence returned:** eight to eleven citations across attached runs, including Reddit and Play
Store. The evidence repeatedly connected changing taste with static profile assumptions.

**PM interpretation:** relevance, freshness, and control should be tested before explanation-heavy
features.

## Targeted product questions

### 7. Do users want more control, and what specifically?

**RAG answer:** yes. Users request a familiar-versus-pure-discovery setting, ways to forget or
exclude songs/artists/genres, protection from temporary contexts such as children's music,
broader recommendation diversity, and immediate ways to steer the next result.

**Evidence returned:** four to eight citations. The strongest requests concern freshness level,
exclusions, and profile repair.

**PM interpretation:** a single freshness slider is not sufficient. Artifact B should combine
session intent, freshness, and lightweight exclusions while keeping setup short.

### 8. What do power users with large libraries say about repeated music?

**RAG answer:** one listener reports hearing roughly the same 100 songs from a 4,000-song liked
library and spending more time skipping than listening. Another reports a playlist with more
than 2,000 tracks repeating about 15 tracks. Other users say recurring recommendations enter
new playlists, radio, or Smart Shuffle despite deliberate organization.

**Evidence returned:** five to six citations, dominated by long-form Reddit comments.

**PM interpretation:** catalog or library size does not guarantee experienced variety. Artifact
B should measure repeat exposure and unique-artist coverage, not only the number of eligible
tracks.

### 9. Do users want to explore new genres or languages but feel unable to?

**RAG answer:** genre evidence is credible. Users describe recommendations staying inside a
narrow subset even when their listening history spans more genres. The attached answer also
mentioned language exploration, but the retrieved records do not establish it as a recurring
pain.

**Evidence returned:** four citations across Reddit and Play Store, primarily about genres and
narrow similarity clusters.

**PM interpretation:** support language metadata in the prototype catalog, but do not position
multilingual discovery as the main problem until interviews validate it.

### 10. Would explanations make users trust recommendations more?

**RAG answer:** explanations may help people understand which behavior influenced a result and
how to correct it. However, transparency cannot rescue recommendations that are irrelevant,
repetitive, or too popular. Evidence for explicit explanation demand is thin.

**Evidence returned:** three to four citations, with mixed and indirect support.

**PM interpretation:** “why this fits” should be a short supporting feature and a separately
measured hypothesis, not the core Artifact B value proposition.

### 11. Do users mention switching because of discovery failures?

**RAG answer:** yes at a qualitative level. Retrieved users describe considering migration,
creating a clean account, or leaving after repeated irrelevant recommendations. One cited user
reported dropping Spotify after about two months.

**Evidence returned:** three to five citations.

**PM interpretation:** this indicates switching risk, not a churn rate. The corpus cannot measure
how common the behavior is.

### 12. What features do users request to improve discovery?

**RAG answer:** adjustable freshness, profile exclusions or reset, diverse and less repetitive
sets, better niche/new-artist discovery, guided genre paths, fresher discovery playlists, and
more effective correction feedback.

**Evidence returned:** five to six citations.

**PM interpretation:** prioritize the smallest interaction that tests intent, freshness, and
steering together. Do not try to rebuild every Spotify discovery surface.

### 13. What do users say about named discovery surfaces?

**RAG answer:** evidence is mixed by surface.

- **Discover Weekly:** repeated complaints about staleness, but also users who still find strong
  recommendations.
- **Release Radar:** less evidence; several positive users call it a useful staple.
- **Daylist:** positive examples describe mood-fit discovery.
- **Radio:** complaints focus on familiar songs resurfacing.
- **Smart Shuffle:** the broad multi-surface query did not retrieve enough targeted evidence in
  one run. A dedicated follow-up query retrieved five specific records, summarized below.

**PM interpretation:** the mixed result argues for augmenting existing recommendation systems,
not replacing every surface.

#### Targeted RAG answer: What do users say specifically about Smart Shuffle?

The targeted answer found four recurring observations:

1. Smart Shuffle can handle a diverse playlist, but can also become stuck repeating the same
   genres or artists until the listener switches playlists or “resets” it.
2. Users associate shuffle behavior with very small repeated subsets, including roughly 100
   songs from a 4,000-song library and about 15 songs from a 2,000-plus-song playlist.
3. A one-star App Store review asks for the older, more random shuffle behavior because the
   current experience repeats the same songs.
4. One Reddit user reports Smart Shuffle turning itself back on after being disabled.

| Evidence | Source | Themes | Link |
|---|---|---|---|
| Hit-or-miss diversity; feature sometimes needs a reset | Reddit | Repetitive recommendations | [Source](https://www.reddit.com/r/Music/comments/1krenis/am_i_the_only_one_whos_spotify_discovery_has/mtdaww5/) |
| Request to restore older shuffle behavior | App Store, 1★ | Recommendations too similar | [Source](https://itunes.apple.com/us/review?id=324684580&type=Purple%20Software) |
| Smart Shuffle turns itself back on | Reddit | UI friction, autoplay loop | [Source](https://www.reddit.com/r/LetsTalkMusic/comments/1g6cq6m/when_did_the_spotify_algorithm_get_so_shit/lsk6rnz/) |
| Roughly 100 of 4,000 liked songs repeat | Reddit | Repetitive recommendations | [Source](https://www.reddit.com/r/LetsTalkMusic/comments/1g6cq6m/when_did_the_spotify_algorithm_get_so_shit/lsj4tyj/) |
| Roughly 15 of 2,000-plus playlist songs repeat | Reddit | Autoplay loop, repetitive recommendations | [Source](https://www.reddit.com/r/LetsTalkMusic/comments/1g6cq6m/when_did_the_spotify_algorithm_get_so_shit/lsjtj5y/) |

This answer combines Smart Shuffle-specific evidence with broader shuffle complaints. It should
not be interpreted as a Smart Shuffle prevalence estimate.

### 14. How do power users describe the problem differently from casual users?

**RAG answer:** power users articulate narrow profile representation, recurring tracks, stale
discovery surfaces, and workarounds in detail. Casual-user evidence is sparse and does not
support a reliable satisfaction comparison.

**Evidence returned:** three to five citations, mostly from inferred power users.

**PM interpretation:** recruit casual or satisfied users as counterexamples. Silence in a
complaint-focused corpus is not evidence of satisfaction.

### 15. What emotional language appears?

**RAG answer:** frustration, disappointment, annoyance, helplessness, boredom, feeling ignored,
and feeling trapped in a loop. Some users describe former favorite songs becoming irritating
after repeated exposure.

**Evidence returned:** five to seven citations.

**PM interpretation:** emotional intensity helps frame interview questions, but it is not a
severity or market-size measure.

## Retrieval evaluation

Automated smoke checks cover control, repetition, Discover Weekly, taste mismatch, genre,
popularity bias, autoplay, source diversity, and off-topic refusal.

```text
9/9 checks passed
Sources retrieved across the suite: App Store, Play Store, Reddit
Off-topic question: refused
```

The checks validate routing and retrieval mechanics. They are not an independent human
relevance benchmark. The next quality gate is manual precision@5 and citation-correctness review.

## Questions for 5–6 interviews

1. Tell me about the last time you wanted new music but returned to something familiar.
2. How did Spotify know, or misunderstand, what you wanted in that moment?
3. What do you do when recommendations become stale?
4. Which temporary listening contexts have affected later recommendations?
5. Would you set a freshness level or describe your intent before a discovery session?
6. What would make an unfamiliar recommendation trustworthy enough to save?
