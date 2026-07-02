# Phase 3 — Embedding & Vector Index

**Goal:** embed the enriched reviews and upsert them (with metadata) into Upstash Vector so
they're retrievable by similarity **and** filterable by metadata. After this phase you can
already query the corpus via curl.

---

## Tasks

1. **Create an Upstash Vector index** (dashboard): dimension **1536**, metric **cosine**
   (matches `text-embedding-3-small`). Copy REST URL + token into `.env`.

2. **Write `scripts/index.mjs`** (or `lib/index.ts`) that:
   - Skips rows where `frustrationThemes = ['non_discovery']` **only if** you want a
     discovery-focused index (recommended). Keep a flag to index everything for the
     dashboard counts.
   - Embeds `title + "\n" + text` with `text-embedding-3-small` (batch up to 100 inputs/call).
   - Upserts to Upstash: `{ id, vector, metadata }`, where metadata carries the full review
     (including the display text).

3. **Verify retrieval** with a test query ("discover weekly repetitive") → print top-5 with
   scores + which themes/segments came back.

---

## Reference snippets

**Embed (OpenAI):**
```js
const emb = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: batchOfTexts,               // string[]
});
```

**Upsert (Upstash Vector SDK `@upstash/vector`):**
```js
import { Index } from '@upstash/vector';
const index = new Index({ url: URL, token: TOKEN });
await index.upsert(rows.map(r => ({
  id: r.id,
  vector: r.embedding,
  metadata: {
    source: r.source, rating: r.rating, date: r.date, country: r.country,
    segment: r.segment, sentiment: r.sentiment,
    discoveryRelated: r.discoveryRelated,
    frustrationThemes: r.frustrationThemes,
    jtbd: r.jtbd, text: r.text, title: r.title, url: r.url,
  },
})));
```

**Query with filter:**
```js
const res = await index.query({
  vector: qEmbedding,
  topK: 20,
  includeMetadata: true,
  filter: "discoveryRelated = true",     // Upstash filter syntax
});
```

---

## Gotchas

- Dimension must match (1536). If you switch to `text-embedding-3-large`, recreate the index
  at 3072.
- Upstash metadata filter syntax is its own mini-language (`field = value`, `AND`, `IN`).
  Test filters early.
- Arrays in metadata (`frustrationThemes`) — confirm filter support for `CONTAINS`; if
  limited, also store a boolean-per-top-theme or a joined string for filtering.
- Upsert is idempotent by `id` — safe to re-run.

---

## Deliverable

A populated Upstash Vector index + `scripts/index.mjs`. A working test query from the CLI.

## Acceptance criteria

- [ ] Vector count in Upstash ≈ number of discovery-related reviews.
- [ ] A CLI test query returns relevant reviews with sensible scores.
- [ ] Metadata filter (`discoveryRelated = true`, and by `segment`) works.
- [ ] Re-running `index.mjs` doesn't duplicate rows.
