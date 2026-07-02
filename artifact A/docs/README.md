# Artifact A — Review Discovery Engine

AI system that analyses Spotify user feedback at scale to understand **why users struggle to
discover new music** and get stuck on repeat. It scrapes reviews (App Store + Play Store),
tags them with an LLM, embeds them into a vector store, and serves:

1. **An insights dashboard** — top discovery frustrations, affected segments, jobs-to-be-done,
   and AI-generated answers to the 6 core research questions (each grounded in cited reviews).
2. **A grounded RAG chat** — ask any question about discovery; get an answer built *only* from
   real reviews, with citations. No hallucinated facts.

## How it works (one glance)

```
Scrape (App/Play)  →  Enrich/tag (gpt-4o-mini)  →  Embed (text-embedding-3-small)
      →  Vector store (local JSON or Upstash)  →  Retrieve + synthesise (grounded, cited)
```

- **Enrichment** tags each review: sentiment, `discoveryRelated`, `frustrationThemes`
  (controlled vocab), `jtbd`, `segment`, `summary`. These power both the dashboard aggregates
  and the retrieval filters.
- **RAG** answers strictly from retrieved reviews with `[n]` citations — the hallucination &
  prompt-injection guard.

## Docs in this folder
| File | What |
|---|---|
| [architecture.md](architecture.md) | Full system design, data model, API surface, safety |
| [QUICKSTART.md](QUICKSTART.md) | Zero → running app in ~10 min |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deploy to Vercel or Render |
| `../phases/phase_1..5.md` | Step-by-step build plan per phase |

## Code
Everything runnable lives in [`../code`](../code). See [`../code/README.md`](../code/README.md)
for the command reference. Default stack: **Next.js 14 · OpenAI · local JSON vector store**
(Upstash optional).

## Deliverable mapping (fellowship Part 1)
- **Workflow link** → the deployed Vercel/Render URL (`/` dashboard + `/ask` chat).
- **1-slider** → screenshot the "How it works" flow above + the dashboard.
- Answers the 6 required questions on the dashboard, each with expandable cited sources.
