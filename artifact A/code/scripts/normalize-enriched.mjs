import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateTag } from '../lib/schema.mjs';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const path = join(DATA, 'reviews.enriched.json');
const rows = JSON.parse(await readFile(path, 'utf8'));
const normalized = rows.map((r) => {
  const text = `${r.title || ''} ${r.text || ''}`;
  const explicitDiscoverySignal = /recommend|discover|algorithm|same songs?|repeat|repetitive|smart shuffle|shuffle.{0,30}same|new music|new artists?|song radio|taste profile|genre exploration/i.test(text);
  const operationalComplaint = /\bads?|advert|premium|queue|download|lyrics|offline|widget|payment|play in order|choose (a |our )?song|select (a |our )?song/i.test(text);
  const candidate = r.discoveryRelated && operationalComplaint && !explicitDiscoverySignal
    ? { ...r, discoveryRelated: false, frustrationThemes: ['non_discovery'], jtbd: null }
    : r;
  const tag = validateTag(candidate);
  if (!tag) throw new Error(`invalid enriched record ${r.id || 'unknown'}`);
  return { ...r, ...tag };
});
await writeFile(path, JSON.stringify(normalized, null, 2), 'utf8');
console.log(`normalized ${normalized.length} enriched records`);
