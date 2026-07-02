/**
 * Phase 3 — embed enriched reviews and upsert to the vector store.
 * Default store = local JSON (data/vectors.json). If UPSTASH_* env vars are set,
 * upserts to Upstash instead.
 *
 * Usage:
 *   node scripts/index.mjs              # real embeddings (needs OPENAI_API_KEY)
 *   node scripts/index.mjs --dry-run    # offline hash-embeddings (no key)
 *   node scripts/index.mjs --all        # include non-discovery reviews too
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getStore, storeKind } from '../lib/vectorstore.mjs';
import { fakeEmbed } from '../lib/fakeembed.mjs';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run');
const ALL = args.has('--all');
const IN = join(DATA, DRY ? 'reviews.enriched.dryrun.json' : 'reviews.enriched.json');

const EMBED_BATCH = 100;

function embedText(r) {
  return `${r.title ? r.title + '\n' : ''}${r.text}`.slice(0, 2000);
}

async function embedBatch(texts) {
  if (DRY) return texts.map(fakeEmbed);
  const { embed } = await import('../lib/llm.mjs');
  return embed(texts);
}

async function main() {
  if (!existsSync(IN)) throw new Error(`missing ${IN} — run enrich first`);
  const enriched = JSON.parse(await readFile(IN, 'utf8')).filter((r) => r.sentiment);
  const rows = ALL ? enriched : enriched.filter((r) => r.discoveryRelated);
  console.log(`indexing ${rows.length}/${enriched.length} reviews (${ALL ? 'all' : 'discovery-only'}) `
    + `-> store=${DRY ? 'local(dry)' : storeKind()}`);

  const store = await getStore({ dry: DRY });
  if (typeof store.clear === 'function' && !args.has('--append')) {
    await store.clear();
  }
  let done = 0;
  for (let i = 0; i < rows.length; i += EMBED_BATCH) {
    const batch = rows.slice(i, i + EMBED_BATCH);
    const vectors = await embedBatch(batch.map(embedText));
    const records = batch.map((r, j) => ({
      id: r.id,
      vector: vectors[j],
      metadata: {
        source: r.source, rating: r.rating, date: r.date, country: r.country,
        language: r.language || null,
        segment: r.segment, sentiment: r.sentiment, discoveryRelated: r.discoveryRelated,
        frustrationThemes: r.frustrationThemes, jtbd: r.jtbd,
        title: r.title, text: r.text, url: r.url,
      },
    }));
    await store.upsert(records);
    done += batch.length;
    process.stdout.write(`  upserted ${done}/${rows.length}\r`);
  }

  const size = await store.size();
  console.log(`\ndone. store now holds ${size} vectors.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
