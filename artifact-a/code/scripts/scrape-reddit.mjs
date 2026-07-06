/**
 * Scrape Reddit threads → write data/reviews.reddit.json → MERGE into data/reviews.raw.json.
 *
 * Two input paths (both used if present):
 *   1) LIVE: fetch each URL in data/reddit-urls.txt (works from a residential IP;
 *      Reddit blocks datacenter IPs with 403).
 *   2) LOCAL FALLBACK: any *.json files you save into data/reddit-raw/ — open each thread's
 *      URL with ".json" appended in your browser and Save As into that folder.
 *
 *   node scripts/scrape-reddit.mjs
 *   node scripts/scrape-reddit.mjs --no-live --file /path/to/thread.json
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fetchThreads, parseThread } from '../lib/reddit.mjs';
import { dedupe, isValidRawReview } from '../lib/review.mjs';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const URLS_FILE = join(DATA, 'reddit-urls.txt');
const RAW_DIR = join(DATA, 'reddit-raw');
const REDDIT_OUT = join(DATA, 'reviews.reddit.json');
const RAW = join(DATA, 'reviews.raw.json');
const argv = process.argv.slice(2);
const NO_LIVE = argv.includes('--no-live');
const EXTRA_FILES = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--file' && argv[i + 1]) EXTRA_FILES.push(argv[++i]);
}

async function fromLocalFiles() {
  const files = existsSync(RAW_DIR)
    ? (await readdir(RAW_DIR)).filter((f) => f.endsWith('.json')).map((f) => join(RAW_DIR, f))
    : [];
  files.push(...EXTRA_FILES);
  const out = [];
  for (const path of files) {
    try {
      const rawText = await readFile(path, 'utf8');
      const data = JSON.parse(rawText);
      const rows = parseThread(data);
      console.log(`  [local] ${path.split('/').pop()}: ${rows.length}`);
      out.push(...rows);
      // Preserve user-supplied attachments under a stable thread id for reproducible rebuilds.
      if (EXTRA_FILES.includes(path)) {
        const threadId = data?.[0]?.data?.children?.[0]?.data?.id;
        if (threadId) await writeFile(join(RAW_DIR, `${threadId}.json`), rawText, 'utf8');
      }
    } catch (e) {
      console.warn(`  [local] ${path} failed: ${e.message}`);
    }
  }
  return out;
}

async function main() {
  await mkdir(RAW_DIR, { recursive: true });
  const urls = existsSync(URLS_FILE)
    ? (await readFile(URLS_FILE, 'utf8')).split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    : [];

  console.log(`LIVE: ${NO_LIVE ? 'skipped (--no-live)' : `fetching ${urls.length} Reddit threads...`}`);
  const live = NO_LIVE ? [] : await fetchThreads(urls);
  console.log(`LOCAL: reading saved JSON from data/reddit-raw/ ...`);
  const local = await fromLocalFiles();

  const reddit = dedupe([...live, ...local].filter(isValidRawReview));
  await writeFile(REDDIT_OUT, JSON.stringify(reddit, null, 2), 'utf8');
  console.log(`\nreddit reviews: ${reddit.length} (live ${live.length}, local ${local.length}) -> ${REDDIT_OUT}`);

  if (reddit.length === 0) {
    console.log('\n⚠ No Reddit data. If LIVE returned 403 (datacenter IP), use the LOCAL path:');
    console.log('   open each URL + ".json" in a browser, Save As into data/reddit-raw/, re-run.');
    return;
  }

  const existing = existsSync(RAW) ? JSON.parse(await readFile(RAW, 'utf8')) : [];
  const merged = dedupe([...existing, ...reddit]);
  await writeFile(RAW, JSON.stringify(merged, null, 2), 'utf8');
  const bySource = {};
  for (const r of merged) bySource[r.source] = (bySource[r.source] || 0) + 1;
  console.log(`merged corpus: ${merged.length} (${JSON.stringify(bySource)}) -> ${RAW}`);
  console.log('\nNext: npm run build:data   (enrich + index + insights)');
}

main().catch((e) => { console.error(e); process.exit(1); });
