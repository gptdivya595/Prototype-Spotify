/**
 * Phase 4 — CLI for the grounded RAG answer.
 *   node scripts/ask.mjs "why do users struggle to discover new music?"
 *   node scripts/ask.mjs --dry-run "why do users struggle to discover new music?"
 */
import { answerQuestion } from '../lib/rag.mjs';

const argv = process.argv.slice(2);
const dry = argv.includes('--dry-run');
const question = argv.filter((a) => !a.startsWith('--')).join(' ')
  || 'What are the most common frustrations with recommendations?';

const res = await answerQuestion(question, { dry });
console.log(`Q: ${question}\n`);
console.log(res.answer);
console.log(`\n--- ${res.citations.length} citations ---`);
for (const c of res.citations.slice(0, 6)) {
  console.log(`[${c.n}] ${c.source} ${c.rating ?? '-'}star [${c.themes.join(',')}]: ${c.quote.slice(0, 100)}`);
}
