import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { answerQuestion } from '../lib/rag.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');
const questions = JSON.parse(await readFile(join(ROOT, 'evals', 'research-questions.json'), 'utf8'));
const insights = JSON.parse(await readFile(join(DATA, 'insights.json'), 'utf8'));
const a = insights.aggregates;
const aggregateContext = [
  `Corpus total=${a.corpus.total}; discovery-related=${a.corpus.discoveryRelated}.`,
  `Sources: ${Object.entries(a.corpus.sources).map(([k, v]) => `${k}=${v}`).join(', ')}.`,
  `Discovery theme counts (multi-label, denominator=${a.corpus.discoveryRelated}): ${a.themes.map(([k, v]) => `${k}=${v}`).join(', ')}.`,
  `Behavior-segment counts: ${Object.entries(a.segments).map(([k, v]) => `${k}=${v}`).join(', ')}.`,
].join('\n');

const answers = [];
for (const question of questions) {
  const result = await answerQuestion(question, { topK: 12, aggregateContext });
  answers.push({ question, ...result });
  process.stdout.write(`answered: ${question}\n`);
}
const payload = { generatedAt: new Date().toISOString(), dataVersion: insights.dataVersion, questions: answers };
await writeFile(join(DATA, 'research-answers.json'), JSON.stringify(payload, null, 2), 'utf8');
console.log(`\nwrote ${answers.length} answers -> data/research-answers.json`);
