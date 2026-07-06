import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const p = join(process.cwd(), 'data', 'insights.json');
    const data = JSON.parse(await readFile(p, 'utf8'));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'insights not built yet — run npm run build:data' }, { status: 503 });
  }
}
