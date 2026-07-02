/**
 * Phase 4 — build the insights payload (aggregates + 6 brief answers) and cache to disk.
 *   node scripts/insights.mjs              # real (needs key)
 *   node scripts/insights.mjs --dry-run    # offline
 */
import { buildInsights } from '../lib/insights.mjs';

const dry = process.argv.includes('--dry-run');
const { payload, outPath } = await buildInsights(dry);

console.log('\n=== aggregates ===');
console.log('corpus:', payload.aggregates.corpus);
console.log('sentiment:', payload.aggregates.sentiment);
console.log('themes:', payload.aggregates.themes);
console.log('segments:', payload.aggregates.segments);
console.log(`\nbrief answers: ${payload.briefAnswers.length}`);
console.log(`\nwrote -> ${outPath}`);
