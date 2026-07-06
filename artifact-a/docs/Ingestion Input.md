# Ingestion Inputs — Discovery Evidence Lab (Artifact A)

This document records the inputs that actually feed the research corpus. Counts describe the
2 July 2026 run, not Spotify's user population.

## Ingested sources

| Source | Scope | Adapter/input | Records | Status |
|---|---|---|---:|---:|
| Apple App Store | Spotify id `324684580`, US recent window | Apple public RSS | 100 | Complete |
| Google Play | `com.spotify.music`, US/en | `google-play-scraper` | 600 | Complete |
| Google Play | `com.spotify.music`, IN/hi | `google-play-scraper` | 600 | Complete |
| Reddit | Seven discovery/algorithm threads | User-saved public JSON | 550 | Complete |

**Total:** 1,850 unique records. **Discovery-related:** 266. Date range: 10 July 2024 to
1 July 2026.

### Reddit distribution

| Community | Records |
|---|---:|
| r/truespotify | 178 |
| r/LetsTalkMusic | 215 |
| r/Music | 157 |

Live Reddit is blocked on the user's VPN/network. Saved JSON is therefore the reproducible
primary route:

```bash
npm run scrape:reddit:offline
```

The seven files are preserved under `data/reddit-raw/<thread-id>.json`. No live fetch is needed.

## Apple adapter policy

`app-store-scraper@0.18.0` has been retained in `devDependencies` as requested. The CLI-only
adapter policy is:

1. Use Apple public RSS by default.
2. If `APPLE_REVIEW_ADAPTER=legacy`, dynamically load `app-store-scraper` locally.
3. If the legacy request returns no reviews, fall back to RSS.

The verified legacy call returned zero Spotify reviews. Keeping it dev-only also prevents its
deprecated transitive dependency chain from being counted as production runtime dependencies.

## Canonical ingestion contract

Every source is normalized before merging:

```text
id, sourceReviewId, source, sourceType, platform, country, language,
rating, title, text, authorHash, publishedAt, fetchedAt, appVersion, url
```

Required behavior:

- reject empty or malformed records;
- retain a native source id where possible;
- use stable ids/content hashes for idempotent reruns;
- retain minimum provenance and a clickable source URL;
- do not require public author handles for product analysis;
- merge by id before enrichment.

## Reproduction commands

```bash
cd "artifact A/code"
npm run scrape
npm run scrape:reddit:offline
npm run manifest
```

`data/ingestion-manifest.json` records total/unique ids, source, country, language, rating,
date range, and limitations.

## Sampling limitations

- Public app reviews and Reddit discussions are self-selected feedback.
- Apple RSS exposes a recent bounded window; it is not complete App Store history.
- Play Store locale requests can overlap, and displayed language metadata comes from the
  requested locale rather than a language detector.
- The seven Reddit threads were purposefully selected for recommendation/discovery discussion.
- Source counts must not be added up and reported as a population prevalence estimate.
- Multilingual discovery is a product capability opportunity, but this corpus does not yet
  validate it as the leading pain point.

## Optional future sources

Add sources only when they answer a research gap:

| Source | Research value | Priority |
|---|---|---:|
| Spotify Community saved exports | Feature requests, workarounds, vote signals | High |
| More varied Reddit threads | Reduce dependence on seven purpose-selected discussions | High |
| Additional Apple/Play markets | Test locale and market differences | Medium |
| User interviews | Verify jobs, context, causality, and willingness to use controls | Essential before Artifact B |

X, YouTube, Trustpilot, and similar sources are not required merely to increase volume. Source
diversity should serve a named research question and comply with each source's terms.
