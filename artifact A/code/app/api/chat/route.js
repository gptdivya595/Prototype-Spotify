import { NextResponse } from 'next/server';
import { answerQuestion } from '../../../lib/rag.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req) {
  try {
    const { question, filters } = await req.json();
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'question (string) required' }, { status: 400 });
    }
    const filter = { discoveryRelated: true, ...(filters || {}) };
    const res = await answerQuestion(question.slice(0, 500), { filter, topK: 12 });
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
