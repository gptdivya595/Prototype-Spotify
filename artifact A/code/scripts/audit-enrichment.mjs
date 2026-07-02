import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { FRUSTRATION_THEMES, SEGMENTS, SENTIMENTS } from '../lib/schema.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');
const rows = JSON.parse(await readFile(join(DATA, 'reviews.enriched.json'), 'utf8'));
const errors = [];
for (const r of rows) {
  if (!SENTIMENTS.includes(r.sentiment)) errors.push({ id: r.id, field: 'sentiment' });
  if (!SEGMENTS.includes(r.segment)) errors.push({ id: r.id, field: 'segment' });
  if (!Array.isArray(r.frustrationThemes) || r.frustrationThemes.some((t) => !FRUSTRATION_THEMES.includes(t))) errors.push({ id: r.id, field: 'themes' });
  if (r.discoveryRelated && r.frustrationThemes.includes('non_discovery')) errors.push({ id: r.id, field: 'discovery_theme_conflict' });
  if (!r.discoveryRelated && !r.frustrationThemes.includes('non_discovery')) errors.push({ id: r.id, field: 'non_discovery_theme_conflict' });
}

// Deterministic stratified audit sample for a PM to label manually during interview validation.
const sample = [];
for (const source of ['app_store', 'play_store', 'reddit']) {
  const sourceRows = rows.filter((r) => r.source === source);
  const discovery = sourceRows.filter((r) => r.discoveryRelated).slice(0, 20);
  const other = sourceRows.filter((r) => !r.discoveryRelated).slice(0, 15);
  sample.push(...discovery, ...other);
}
await writeFile(join(ROOT, 'evals', 'enrichment-sample.json'), JSON.stringify(sample.map((r) => ({
  id: r.id,
  source: r.source,
  rating: r.rating,
  text: r.text.slice(0, 500),
  modelLabels: {
    sentiment: r.sentiment,
    discoveryRelated: r.discoveryRelated,
    frustrationThemes: r.frustrationThemes,
    segment: r.segment,
    jtbd: r.jtbd,
  },
  humanLabels: null,
})), null, 2), 'utf8');

const report = {
  generatedAt: new Date().toISOString(),
  records: rows.length,
  schemaErrors: errors.length,
  schemaPassRate: (rows.length - errors.length) / rows.length,
  sampleSize: sample.length,
  manualLabelStatus: 'pending_primary_research_validation',
  errors: errors.slice(0, 50),
};
await writeFile(join(ROOT, 'evals', 'enrichment-audit.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
