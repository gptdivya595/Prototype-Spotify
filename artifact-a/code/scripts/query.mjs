/**
 * Phase 3 — CLI retrieval tester.
 *   node scripts/query.mjs "discover weekly is repetitive"
 *   node scripts/query.mjs --dry-run "discover weekly is repetitive"
 *   node scripts/query.mjs --segment power_user "recommendations too similar"
 */
import { getStore } from '../lib/vectorstore.mjs';
import { fakeEmbed } from '../lib/fakeembed.mjs';

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const segIdx = argv.indexOf('--segment');
const segment = segIdx >= 0 ? argv[segIdx + 1] : undefined;
const q = argv.filter((a, i) => !a.startsWith('--') && i !== segIdx + 1).join(' ')
  || 'discover weekly keeps recommending the same songs';

async function embedQuery(text) {
  if (DRY) return fakeEmbed(text);
  const { embed } = await import('../lib/llm.mjs');
  return (await embed([text]))[0];
}

const store = await getStore();
const vector = await embedQuery(q);
const hits = await store.query({ vector, topK: 5, filter: { discoveryRelated: true, segment } });

console.log(`query: "${q}"${segment ? ` [segment=${segment}]` : ''}\n`);
for (const h of hits) {
  console.log(`(${h.score.toFixed(3)}) ${h.metadata.source} ${h.metadata.rating ?? '-'}★ `
    + `[${(h.metadata.frustrationThemes || []).join(',')}]`);
  console.log(`   ${(h.metadata.text || '').slice(0, 140).replace(/\s+/g, ' ')}\n`);
}
