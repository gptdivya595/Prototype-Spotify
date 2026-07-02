/** Local CLI-only Apple adapter retained for explicit compatibility testing. */
import storeImport from 'app-store-scraper';
import { APP_STORE_ID } from './scrape.mjs';
import { makeId, cleanAuthor, hashAuthor, toISO } from './review.mjs';

const store = storeImport?.default ?? storeImport;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function scrapeAppStoreLegacy({ countries = ['us'], pages = 10 } = {}) {
  if (process.env.VERCEL) {
    throw new Error('the legacy Apple adapter is local-only; use Apple RSS on Vercel');
  }
  const out = [];
  for (const country of countries) {
    for (let page = 1; page <= pages; page++) {
      try {
        const rows = await store.reviews({
          id: APP_STORE_ID,
          country,
          page,
          sort: store.sort.RECENT,
        });
        if (!rows?.length) break;
        for (const row of rows) {
          const text = row.text || '';
          if (!text.trim()) continue;
          const date = toISO(row.updated);
          const author = cleanAuthor(row.userName);
          out.push({
            id: makeId('app_store', author, date, text),
            sourceReviewId: row.id ? String(row.id) : null,
            source: 'app_store',
            sourceType: 'review',
            platform: 'ios',
            country,
            language: null,
            rating: typeof row.score === 'number' ? row.score : null,
            title: row.title || null,
            text,
            authorHash: hashAuthor('app_store', author),
            date,
            fetchedAt: new Date().toISOString(),
            appVersion: row.version || null,
            url: row.url || null,
          });
        }
        await sleep(250);
      } catch (error) {
        console.warn(`  [legacy app_store ${country} page ${page}] ${error.message}`);
        break;
      }
    }
  }
  return out;
}
