/**
 * Phase 1 — bulk scraper CLI (thin wrapper over lib/scrape.mjs).
 *   node scripts/scrape.mjs            # full run
 *   node scripts/scrape.mjs --small    # quick smoke test
 *   node scripts/scrape.mjs --appstore-only | --play-only
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { scrapeAppStore, scrapePlay } from '../lib/scrape.mjs';
import { dedupe, isValidRawReview } from '../lib/review.mjs';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const OUT = join(DATA_DIR, 'reviews.raw.json');
const args = new Set(process.argv.slice(2));
const SMALL = args.has('--small');

const appStoreOpts = SMALL
  ? { countries: ['us'], pages: 2 }
  : { countries: ['us', 'gb', 'in', 'ca', 'au', 'de'], pages: 10 };
const playOpts = SMALL
  ? { countries: ['us'], num: 80 }
  : { countries: ['us', 'gb', 'in', 'ca', 'au'], num: 600 };

function printStats(reviews) {
  const bySource = {}, byRating = {};
  for (const r of reviews) {
    bySource[r.source] = (bySource[r.source] || 0) + 1;
    byRating[r.rating ?? 'null'] = (byRating[r.rating ?? 'null'] || 0) + 1;
  }
  console.log('\n=== corpus stats ===');
  console.log('total:', reviews.length, '| by source:', bySource, '| by rating:', byRating);
}

async function main() {
  console.log(`Scraping Spotify reviews${SMALL ? ' (SMALL)' : ''}...`);
  let all = [];
  if (!args.has('--play-only')) {
    const a = await scrapeAppStore(appStoreOpts);
    console.log(`  app_store: ${a.length}`);
    all = all.concat(a);
  }
  if (!args.has('--appstore-only')) {
    const p = await scrapePlay(playOpts);
    console.log(`  play_store: ${p.length}`);
    all = all.concat(p);
  }
  const unique = dedupe(all.filter(isValidRawReview));
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(OUT, JSON.stringify(unique, null, 2), 'utf8');
  printStats(unique);
  console.log(`\nwrote ${unique.length} reviews -> ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
