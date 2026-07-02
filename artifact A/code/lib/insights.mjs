/**
 * Phase 4 — dashboard aggregates + the 6 precomputed brief questions.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { answerQuestion } from './rag.mjs';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');

export const BRIEF_QUESTIONS = [
  'Why do users struggle to discover new music?',
  'What are the most common frustrations with recommendations?',
  'What listening behaviours are users trying to achieve?',
  'What causes users to repeatedly listen to the same content?',
  'Which user segments experience different discovery challenges?',
  'What unmet needs emerge consistently across reviews?',
];

function enrichedPath(dry) {
  return join(DATA, dry ? 'reviews.enriched.dryrun.json' : 'reviews.enriched.json');
}

/** Compute aggregate counts from the enriched corpus. */
export async function computeAggregates(dry = false) {
  const path = enrichedPath(dry);
  if (!existsSync(path)) throw new Error(`missing ${path} — run enrich first`);
  const all = JSON.parse(await readFile(path, 'utf8')).filter((r) => r.sentiment);

  const total = all.length;
  const discovery = all.filter((r) => r.discoveryRelated);
  const sentiment = { positive: 0, neutral: 0, negative: 0 };
  const themes = {};
  const segments = {};
  const segmentTheme = {};
  const jtbds = {};
  const sources = {};

  for (const r of all) {
    sentiment[r.sentiment] = (sentiment[r.sentiment] || 0) + 1;
    sources[r.source] = (sources[r.source] || 0) + 1;
  }
  for (const r of discovery) {
    segments[r.segment] = (segments[r.segment] || 0) + 1;
    if (r.jtbd) jtbds[r.jtbd] = (jtbds[r.jtbd] || 0) + 1;
    for (const t of r.frustrationThemes || []) {
      if (t === 'non_discovery') continue;
      themes[t] = (themes[t] || 0) + 1;
      segmentTheme[r.segment] = segmentTheme[r.segment] || {};
      segmentTheme[r.segment][t] = (segmentTheme[r.segment][t] || 0) + 1;
    }
  }

  const topThemes = Object.entries(themes).sort((a, b) => b[1] - a[1]);
  const topJtbds = Object.entries(jtbds).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return {
    corpus: { total, discoveryRelated: discovery.length, sources },
    sentiment,
    themes: topThemes,
    segments,
    segmentTheme,
    topJtbds,
    generatedAt: new Date().toISOString(),
  };
}

/** Run the 6 brief questions through the RAG pipeline and cache them. */
export async function computeBriefAnswers(dry = false) {
  const out = [];
  for (const q of BRIEF_QUESTIONS) {
    const res = await answerQuestion(q, { dry, topK: 12 });
    out.push({ question: q, ...res });
    process.stdout.write(`  answered: ${q.slice(0, 40)}...\n`);
  }
  return out;
}

/** Build and persist the full insights payload (aggregates + brief answers). */
export async function buildInsights(dry = false) {
  const aggregates = await computeAggregates(dry);
  const briefAnswers = await computeBriefAnswers(dry);
  const payload = { aggregates, briefAnswers };
  const outPath = join(DATA, dry ? 'insights.dryrun.json' : 'insights.json');
  await writeFile(outPath, JSON.stringify(payload, null, 2), 'utf8');
  return { payload, outPath };
}
