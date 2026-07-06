import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { answerQuestion } from '../../../lib/rag.mjs';
import { FRUSTRATION_THEMES, SEGMENTS } from '../../../lib/schema.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const SOURCES = new Set(['app_store', 'play_store', 'reddit']);
const rate = globalThis.__artifactAChatRate || new Map();
globalThis.__artifactAChatRate = rate;

// CORS so the static Vercel summary page can call this Cloud Run backend
// cross-origin. Read-only public endpoint; ACAO can be restricted to the
// Vercel origin via CHAT_ALLOWED_ORIGIN if desired.
const CORS = {
  'Access-Control-Allow-Origin': process.env.CHAT_ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function json(body, init = {}) {
  return NextResponse.json(body, { ...init, headers: { ...CORS, ...(init.headers || {}) } });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

function allowedRequest(ip) {
  const now = Date.now();
  const row = rate.get(ip) || { started: now, count: 0 };
  if (now - row.started > 60_000) {
    row.started = now;
    row.count = 0;
  }
  row.count += 1;
  rate.set(ip, row);
  return row.count <= 12;
}

function sanitizeFilters(filters = {}) {
  const out = { discoveryRelated: true };
  if (SEGMENTS.includes(filters.segment)) out.segment = filters.segment;
  if (FRUSTRATION_THEMES.includes(filters.theme) && filters.theme !== 'non_discovery') out.theme = filters.theme;
  if (SOURCES.has(filters.source)) out.source = filters.source;
  if (typeof filters.country === 'string' && /^[a-z/]{2,32}$/i.test(filters.country)) out.country = filters.country;
  if (typeof filters.language === 'string' && /^[a-z-]{2,12}$/i.test(filters.language)) out.language = filters.language;
  return out;
}

async function loadAggregateContext() {
  try {
    const payload = JSON.parse(await readFile(join(process.cwd(), 'data', 'insights.json'), 'utf8'));
    const a = payload.aggregates;
    return {
      dataVersion: payload.dataVersion || a.generatedAt,
      text: [
        `Corpus total=${a.corpus.total}; discovery-related=${a.corpus.discoveryRelated}.`,
        `Sources: ${Object.entries(a.corpus.sources).map(([k, v]) => `${k}=${v}`).join(', ')}.`,
        `Discovery theme counts (multi-label, denominator=${a.corpus.discoveryRelated}): ${a.themes.map(([k, v]) => `${k}=${v}`).join(', ')}.`,
        `Behavior-segment counts: ${Object.entries(a.segments).map(([k, v]) => `${k}=${v}`).join(', ')}.`,
      ].join('\n'),
    };
  } catch {
    return { dataVersion: null, text: '' };
  }
}

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    if (!allowedRequest(ip)) {
      return json({ error: 'rate limit exceeded; retry in one minute' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    if (!question) return json({ error: 'question (string) required' }, { status: 400 });
    if (question.length > 500) return json({ error: 'question must be 500 characters or fewer' }, { status: 400 });

    const filters = sanitizeFilters(body.filters);
    const aggregates = await loadAggregateContext();
    const res = await answerQuestion(question, {
      filter: filters,
      topK: 12,
      aggregateContext: aggregates.text,
    });
    return json({ ...res, dataVersion: aggregates.dataVersion });
  } catch (e) {
    console.error('chat_error', e?.message || e);
    return json({ error: 'unable to answer from the review corpus' }, { status: 500 });
  }
}
