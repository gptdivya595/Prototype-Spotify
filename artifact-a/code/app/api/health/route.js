import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getStore, storeKind } from '../../../lib/vectorstore.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const insights = JSON.parse(await readFile(join(process.cwd(), 'data', 'insights.json'), 'utf8'));
    const store = await getStore();
    return NextResponse.json({
      ok: true,
      storage: storeKind(),
      vectors: await store.size(),
      corpus: insights.aggregates?.corpus || null,
      dataVersion: insights.dataVersion || insights.aggregates?.generatedAt || null,
      remoteIngestEnabled: Boolean(process.env.UPSTASH_VECTOR_REST_URL && process.env.INGEST_ADMIN_KEY),
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'serving artifacts are unavailable' }, { status: 503 });
  }
}
