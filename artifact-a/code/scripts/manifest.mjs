import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const rows = JSON.parse(await readFile(join(DATA, 'reviews.raw.json'), 'utf8'));
const bySource = {}, byCountry = {}, byLanguage = {}, byRating = {};
let oldest = null, newest = null;
for (const r of rows) {
  bySource[r.source] = (bySource[r.source] || 0) + 1;
  byCountry[r.country || 'unknown'] = (byCountry[r.country || 'unknown'] || 0) + 1;
  byLanguage[r.language || 'unknown'] = (byLanguage[r.language || 'unknown'] || 0) + 1;
  byRating[r.rating ?? 'none'] = (byRating[r.rating ?? 'none'] || 0) + 1;
  if (r.date && (!oldest || r.date < oldest)) oldest = r.date;
  if (r.date && (!newest || r.date > newest)) newest = r.date;
}
const manifest = {
  generatedAt: new Date().toISOString(),
  total: rows.length,
  uniqueIds: new Set(rows.map((r) => r.id)).size,
  bySource,
  byCountry,
  byLanguage,
  byRating,
  dateRange: { oldest, newest },
  limitations: [
    'Public feedback is self-selected and is not a representative sample of all Spotify listeners.',
    'App Store public RSS exposes a recent bounded window; Google Play locale results can overlap.',
    'Reddit threads were purposefully selected for discovery/recommendation discussion.',
  ],
};
await writeFile(join(DATA, 'ingestion-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log(JSON.stringify(manifest, null, 2));
