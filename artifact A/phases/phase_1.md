# Phase 1 — Collect a Traceable, Multi-source Corpus

**Outcome:** a reproducible raw corpus with enough source diversity to investigate Spotify
discovery problems without hiding sampling bias.

**Current status (2 July 2026):** **Complete for the bounded prototype** — 1,850 unique records
span App Store, Play Store, and 550 Reddit posts/comments. The manifest reports source, locale,
rating, date range, and limitations. Reddit rebuilds work fully offline from seven saved files.

## Why this phase exists

The engine cannot discover the real problem if it only analyses whichever reviews were easiest
to scrape. Store reviews are useful for scale and ratings; Reddit/community discussions add
the longer explanations, workarounds, and context needed for “why”.

## Inputs

- Spotify App Store id: `324684580`.
- Spotify Play Store id: `com.spotify.music`.
- Allow-listed Reddit/community URLs relevant to discovery and recommendations.
- Sampling configuration: source, country, language, sort, pages/limit.

## Work plan

### 1. Freeze the canonical raw schema

Add or validate these fields before saving a record:

```text
id, sourceReviewId, source, sourceType, platform, country, language,
rating, title, text, authorHash, publishedAt, fetchedAt, appVersion, url
```

- Preserve the native source id when available.
- Compute a stable content hash for dedupe across re-runs.
- Hash or omit the author handle; it is not needed for product research.
- Reject empty text, invalid ratings, malformed dates, and records without provenance.

### 2. Make App Store collection explicit

Use Apple's public RSS feed with the fixed Spotify id. Retain `app-store-scraper.reviews` as an
optional local legacy adapter:

```js
store.reviews({
  id: 324684580,
  country: 'us',
  page: 1,
  sort: store.sort.RECENT,
});
```

- Set `APPLE_REVIEW_ADAPTER=legacy` to try the retained library first; fall back to RSS when it
  returns no reviews.
- Loop the bounded RSS pages for each configured country.
- Start with `us`, `gb`, `in`, `ca`, and `au`.
- Throttle between requests and keep partial results if one country fails.
- Record returned count and oldest/newest date per country.

### 3. Make Play Store pagination and language explicit

Use `google-play-scraper.reviews` with `paginate: true` and follow the returned token:

```js
gplay.reviews({
  appId: 'com.spotify.music',
  country: 'in',
  lang: 'en',
  sort: gplay.sort.NEWEST,
  paginate: true,
  nextPaginationToken,
});
```

- Stop at the configured total, a missing token, or a maximum page guard.
- Do not assume `num` controls page size when pagination is enabled.
- Run an explicit locale matrix, including `in/en` and a small `in/hi` sample if returned by
  the source.

### 4. Add one discussion-source family

- Ingest the seven allow-listed Reddit threads already in `data/reddit-urls.txt` through live
  JSON or browser-saved JSON.
- Normalise a thread post and each useful comment as separate records, retaining thread URL,
  parent id, date, and source type.
- If Reddit remains blocked, add a Spotify Community saved-export adapter rather than silently
  shipping a store-only corpus.

### 5. Write an ingestion run manifest

For every run, persist:

- configuration and code/data version;
- started/finished timestamps;
- fetched, valid, duplicate, rejected, and failed counts;
- counts and date range by source/country/language;
- failure stage and reason without secrets.

### 6. Produce a coverage report

Generate a small Markdown/JSON report showing source mix, rating distribution, recency, locale,
and known bias. Never label the corpus “representative of Spotify users”.

## Existing implementation to retain

- `code/lib/scrape.mjs`
- `code/lib/review.mjs`
- `code/lib/reddit.mjs`
- `code/scripts/scrape.mjs`
- `code/scripts/scrape-reddit.mjs`

## Verification

```bash
cd "artifact A/code"
npm ci
npm run scrape:small
npm run scrape
npm run scrape:reddit:offline
npm run manifest
npm run anonymize
```

Run the same small configuration twice and confirm the second run creates no duplicate ids.

## Deliverables

- `data/reviews.raw.json` (local/ignored if source terms require it).
- `data/ingestion-manifest.json`.
- Coverage and limitations inside `data/ingestion-manifest.json`.
- A redacted sample of records for schema review.

## Exit criteria

- [x] At least 1,000 valid store reviews across App Store and Play Store (actual: 1,300).
- [x] At least 300 posts/comments from one discussion/community source (actual: 550 Reddit).
- [x] Counts, date range, country, and language are visible by source.
- [x] Stable ids and merge-time deduplication make repeated imports idempotent.
- [x] Partial source failures are reported rather than swallowed.
- [x] Public handles are removed from corpus artifacts; only deterministic hashes are retained.

**Gate to Phase 2:** passed for the prototype. The source sample remains self-selected and is
not a population estimate.
