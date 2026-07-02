/**
 * Vector store with two interchangeable backends:
 *   - LocalVectorStore  : JSON file + in-memory cosine (default; zero setup)
 *   - UpstashVectorStore : @upstash/vector (used when UPSTASH_* env vars are present)
 *
 * Uniform API: upsert(rows), query({ vector, topK, filter }), size().
 * `filter` is a structured object: { discoveryRelated?: boolean, segment?: string,
 *   theme?: string } — each backend translates it.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadEnv } from './env.mjs';

loadEnv();

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const LOCAL_PATH = join(DATA, 'vectors.json');
const LOCAL_DRY_PATH = join(DATA, 'vectors.dryrun.json');

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

function matches(meta, filter) {
  if (!filter) return true;
  if (filter.discoveryRelated !== undefined && Boolean(meta.discoveryRelated) !== filter.discoveryRelated)
    return false;
  if (filter.segment && meta.segment !== filter.segment) return false;
  if (filter.theme && !(meta.frustrationThemes || []).includes(filter.theme)) return false;
  if (filter.source && meta.source !== filter.source) return false;
  if (filter.country && meta.country !== filter.country) return false;
  if (filter.language && meta.language !== filter.language) return false;
  return true;
}

export class LocalVectorStore {
  constructor(path = LOCAL_PATH) {
    this.path = path;
    this.rows = [];
    this.loaded = false;
  }
  async load() {
    if (this.loaded) return;
    if (existsSync(this.path)) this.rows = JSON.parse(await readFile(this.path, 'utf8'));
    this.loaded = true;
  }
  async upsert(rows) {
    await this.load();
    const byId = new Map(this.rows.map((r) => [r.id, r]));
    for (const r of rows) byId.set(r.id, r);
    this.rows = [...byId.values()];
    await mkdir(DATA, { recursive: true });
    await writeFile(this.path, JSON.stringify(this.rows), 'utf8');
  }
  async clear() {
    this.rows = [];
    this.loaded = true;
    await mkdir(DATA, { recursive: true });
    await writeFile(this.path, '[]', 'utf8');
  }
  async query({ vector, topK = 20, filter }) {
    await this.load();
    return this.rows
      .filter((r) => matches(r.metadata, filter))
      .map((r) => ({ id: r.id, score: cosine(vector, r.vector), metadata: r.metadata }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
  async size() {
    await this.load();
    return this.rows.length;
  }
}

export class UpstashVectorStore {
  constructor(Index) {
    this.index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN,
    });
  }
  async upsert(rows) {
    // upsert in chunks of 100
    for (let i = 0; i < rows.length; i += 100) {
      await this.index.upsert(rows.slice(i, i + 100).map((r) => ({
        id: r.id, vector: r.vector, metadata: r.metadata,
      })));
    }
  }
  _filterStr(filter) {
    if (!filter) return undefined;
    const parts = [];
    if (filter.discoveryRelated !== undefined) parts.push(`discoveryRelated = ${filter.discoveryRelated}`);
    if (filter.segment) parts.push(`segment = '${filter.segment}'`);
    if (filter.theme) parts.push(`frustrationThemes CONTAINS '${filter.theme}'`);
    if (filter.source) parts.push(`source = '${filter.source}'`);
    if (filter.country) parts.push(`country = '${filter.country}'`);
    if (filter.language) parts.push(`language = '${filter.language}'`);
    return parts.length ? parts.join(' AND ') : undefined;
  }
  async query({ vector, topK = 20, filter }) {
    const res = await this.index.query({
      vector, topK, includeMetadata: true, filter: this._filterStr(filter),
    });
    return res.map((r) => ({ id: r.id, score: r.score, metadata: r.metadata }));
  }
  async size() {
    const info = await this.index.info();
    return info.vectorCount ?? 0;
  }
}

/** Pick a backend: Upstash if configured, else local JSON. */
export async function getStore({ dry = false } = {}) {
  if (dry) return new LocalVectorStore(LOCAL_DRY_PATH);
  const hasUpstash =
    process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN;
  if (hasUpstash) {
    const { Index } = await import('@upstash/vector');
    return new UpstashVectorStore(Index);
  }
  return new LocalVectorStore(LOCAL_PATH);
}

export function storeKind() {
  return process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN
    ? 'upstash'
    : 'local';
}
