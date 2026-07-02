# Phase 5 — UI + Deploy to Vercel

**Goal:** wrap the APIs in a clean two-tab Next.js UI and ship a public Vercel URL a reviewer
can test. This is the actual Part-1 deliverable link.

---

## UI scope (keep it minimal, make it legible)

**Tab 1 — Insights (default / landing)**
- Header: what this is, corpus size, sources, last-updated.
- Cards for the **6 precomputed answers** (question → answer → expandable citations).
- Charts: frustration-theme bar chart, sentiment split, discovery-related %, segment ×
  top-theme. (Use a light lib like Recharts, or plain divs — this doubles as a deck slide.)

**Tab 2 — Ask (chat)**
- Text box + optional filter chips (segment, theme).
- Streams/returns the grounded answer.
- **Citations panel**: each cited review shown with source, rating, date, quote — this is the
  trust proof; make it prominent.

**Tab 3 — Ingest (optional, can be an admin corner)**
- "Refresh latest N" button → `POST /api/ingest`, show progress + new count.
- Note in UI that bulk load is done via the local script.

---

## Tasks

1. **Scaffold Next.js** (App Router, TypeScript) and fold the Phase 1–4 code into it:
   - `app/api/{scrape,enrich,index,chat,insights,ingest}/route.ts`
   - `app/(ui)/page.tsx` (Insights), `app/ask/page.tsx`, `app/ingest/page.tsx`
   - `lib/{llm,vector,enrich,scrape}.ts`
2. **Wire the pages** to the APIs (fetch, loading states, error states).
3. **Seed the deployed index**: run the local `scrape → enrich → index` once against the prod
   Upstash index so the URL has data on first load.
4. **Deploy to Vercel**: push to GitHub → import → set env vars (§10 architecture) → deploy.
5. **Make it demo-proof**: precomputed answers load without any live LLM call; chat is the
   interactive extra.

---

## Vercel deployment checklist

- [ ] `OPENAI_API_KEY`, `UPSTASH_VECTOR_REST_URL`, `UPSTASH_VECTOR_REST_TOKEN` set in Vercel
      env (Production + Preview).
- [ ] Long routes: set `export const maxDuration = 60` on `/api/ingest` if on a plan that
      allows it; otherwise keep N small.
- [ ] Node runtime (not edge) for API routes using the scraper libs:
      `export const runtime = 'nodejs'`.
- [ ] `.env.local` gitignored; secrets only in Vercel dashboard.
- [ ] Test the public URL in an incognito window (no local state).

---

## Gotchas

- The scraper libs need the **Node** runtime — do not put them on Edge functions.
- If `/api/ingest` times out on Vercel free tier, disable the button in prod and rely on the
  pre-seeded index; the local script is the real ingest path.
- Colour choices: ensure charts are colour-blind safe and text is readable (fellowship rule).

---

## Deliverable

- A **public Vercel URL** (the Part-1 workflow link) with a working Insights dashboard + Ask
  chat.
- Screenshots of insights + one chat answer with citations → feed the 1-slider explaining
  how the engine works.

## Acceptance criteria

- [ ] Public URL loads the Insights tab with real data, no login.
- [ ] Ask a discovery question → grounded answer + visible citations.
- [ ] Works in incognito / on a phone.
- [ ] The "how it works" story is screenshot-ready for the deck's 1-slider.
