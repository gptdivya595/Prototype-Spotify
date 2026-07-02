import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { isInScopeQuestion, retrieve } from '../lib/rag.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const cases = JSON.parse(await readFile(join(ROOT, 'evals', 'rag-questions.json'), 'utf8'));
const results = [];

for (const c of cases) {
  if (c.expectOutOfScope) {
    const pass = !isInScopeQuestion(c.question);
    results.push({ ...c, pass, observed: { inScope: !pass } });
    continue;
  }
  const hits = await retrieve(c.question, { topK: 10 });
  const themeHits = c.expectedTheme
    ? hits.filter((h) => (h.metadata.frustrationThemes || []).includes(c.expectedTheme)).length
    : null;
  const sources = [...new Set(hits.map((h) => h.metadata.source))];
  const pass = (c.minThemeHits == null || themeHits >= c.minThemeHits)
    && (c.minSources == null || sources.length >= c.minSources);
  results.push({
    ...c,
    pass,
    observed: {
      hitCount: hits.length,
      themeHits,
      sources,
      topScores: hits.slice(0, 5).map((h) => Number(h.score.toFixed(4))),
    },
  });
  process.stdout.write(`${pass ? 'PASS' : 'FAIL'} ${c.id}: themes=${themeHits ?? '-'} sources=${sources.join(',')}\n`);
}

const passed = results.filter((r) => r.pass).length;
const payload = {
  generatedAt: new Date().toISOString(),
  passed,
  total: results.length,
  passRate: passed / results.length,
  note: 'Automated theme/source checks are smoke tests; final product claims still require human citation review.',
  results,
};
await writeFile(join(ROOT, 'evals', 'rag-results.json'), JSON.stringify(payload, null, 2), 'utf8');
console.log(`\n${passed}/${results.length} retrieval checks passed.`);
if (passed !== results.length) process.exitCode = 1;
