# Phase 1 — Scraping & Ingestion

**Goal:** get a corpus of a few thousand real Spotify reviews into a clean, normalised
`Review[]` JSON file, from App Store + Play Store (+ optional Reddit).

**Why local-first:** `google-play-scraper` does live web scraping — slow and occasionally
IP-blocked, which will time out on Vercel serverless. So bulk collection runs as a **local
Node script**; the deployed app later only does small bounded refreshes.

---

## Tasks

1. **Init a Node project** in `code/` (this becomes the Next.js app in Phase 5; fine to start
   plain).
   ```bash
   cd "artifact A/code" && npm init -y
   npm i app-store-scraper google-play-scraper
   ```

2. **Write `scripts/scrape.mjs`** that:
   - Pulls App Store reviews across several countries (each country caps at ~10 pages × 50).
   - Pulls Play Store reviews with pagination tokens.
   - Normalises both into the canonical `Review` shape (see architecture.md §5).
   - Dedupes by `id` and writes `data/reviews.raw.json`.

3. **(Optional) Reddit** via public JSON — no auth:
   `https://www.reddit.com/r/spotify/search.json?q=discover%20OR%20recommendation&restrict_sr=1&sort=relevance&limit=100`
   Map posts + top comments into `Review` with `source:'reddit'`, `rating:null`.

4. **Sanity check:** print counts by source, country, rating distribution.

---

## Reference snippets

**App Store** (`app-store-scraper`):
```js
import store from 'app-store-scraper';
// id = 324684580, loop pages 1..10 and a few countries
const r = await store.reviews({ id: 324684580, country: 'us', sort: store.sort.RECENT, page: 1 });
```

**Play Store** (`google-play-scraper`):
```js
import gplay from 'google-play-scraper';
const { data, nextPaginationToken } = await gplay.reviews({
  appId: 'com.spotify.music', sort: gplay.sort.NEWEST, num: 200, country: 'us', lang: 'en'
});
```

**Normaliser (both → Review):**
```js
import { createHash } from 'crypto';
const id = (s, author, date, text) =>
  createHash('sha1').update(`${s}|${author}|${date}|${text.slice(0,50)}`).digest('hex').slice(0,12);
```

---

## Gotchas

- App Store caps at ~500 reviews/country → loop `['us','gb','in','ca','au','de']` to widen.
- Play Store: throttle (200–400 ms between pages) to avoid blocks; wrap in try/catch and
  keep partial results.
- Keep raw text verbatim (needed for citations); only truncate author names.
- Commit `data/reviews.raw.json` OR keep it gitignored and re-runnable — your call, but the
  file is the hand-off to Phase 2.

---

## Deliverable

`code/data/reviews.raw.json` — deduped `Review[]` (target ≥ 2,000 rows), enrichment fields
empty/undefined for now.

## Acceptance criteria

- [ ] Script runs end-to-end with one command (`node scripts/scrape.mjs`).
- [ ] ≥ 2,000 unique reviews across ≥ 2 sources.
- [ ] Every row validates against the `Review` shape (minus enrichment fields).
- [ ] Rating distribution + source counts printed to console.
