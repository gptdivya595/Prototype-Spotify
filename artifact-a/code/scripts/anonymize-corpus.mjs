/** Remove persisted public handles from local corpus artifacts without changing record ids. */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { hashAuthor } from '../lib/review.mjs';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const FILES = ['reviews.raw.json', 'reviews.reddit.json', 'reviews.enriched.json'];
const migrationFetchedAt = new Date().toISOString();

for (const filename of FILES) {
  const path = join(DATA, filename);
  if (!existsSync(path)) continue;
  const records = JSON.parse(await readFile(path, 'utf8'));
  let removed = 0;
  const migrated = records.map((record) => {
    const next = { ...record };
    if (!next.authorHash && next.author) next.authorHash = hashAuthor(next.source, next.author);
    if (Object.hasOwn(next, 'author')) {
      delete next.author;
      removed++;
    }
    if (!next.sourceType) {
      next.sourceType = next.source === 'reddit'
        ? (next.title ? 'post' : 'comment')
        : 'review';
    }
    if (!next.fetchedAt) next.fetchedAt = migrationFetchedAt;
    return next;
  });
  await writeFile(path, JSON.stringify(migrated, null, 2), 'utf8');
  console.log(`${filename}: ${migrated.length} records, removed ${removed} handles`);
}
