/**
 * Shared scraping logic used by scripts/scrape.mjs (bulk) and /api/ingest (bounded).
 */
import storeImport from 'app-store-scraper';
import gplayImport from 'google-play-scraper';
import { makeId, cleanAuthor, toISO, dedupe, isValidRawReview } from './review.mjs';

const store = storeImport?.default ?? storeImport;
const gplay = gplayImport?.default ?? gplayImport;

export const APP_STORE_ID = 324684580;
export const PLAY_APP_ID = 'com.spotify.music';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function scrapeAppStore({ countries = ['us'], pages = 10 } = {}) {
  const out = [];
  for (const country of countries) {
    for (let page = 1; page <= pages; page++) {
      try {
        const rows = await store.reviews({ id: APP_STORE_ID, country, page, sort: store.sort.RECENT });
        if (!rows?.length) break;
        for (const r of rows) {
          const text = r.text || '';
          if (!text.trim()) continue;
          const date = toISO(r.updated);
          const author = cleanAuthor(r.userName);
          out.push({
            id: makeId('app_store', author, date, text),
            source: 'app_store', platform: 'ios', country,
            rating: typeof r.score === 'number' ? r.score : null,
            title: r.title || null, text, author, date,
            appVersion: r.version || null, url: r.url || null,
          });
        }
        await sleep(250);
      } catch {
        break;
      }
    }
  }
  return out;
}

export async function scrapePlay({ countries = ['us'], num = 600 } = {}) {
  const out = [];
  for (const country of countries) {
    let token, collected = 0, guard = 0;
    while (collected < num && guard < 20) {
      guard++;
      try {
        const res = await gplay.reviews({
          appId: PLAY_APP_ID, sort: gplay.sort.NEWEST,
          num: Math.min(150, num - collected), country, lang: 'en',
          paginate: true, nextPaginationToken: token,
        });
        const rows = res?.data ?? [];
        if (!rows.length) break;
        for (const r of rows) {
          const text = r.text || '';
          if (!text.trim()) continue;
          const date = toISO(r.date ?? r.at);
          const author = cleanAuthor(r.userName);
          out.push({
            id: makeId('play_store', author, date, text),
            source: 'play_store', platform: 'android', country,
            rating: typeof r.score === 'number' ? r.score : null,
            title: r.title || null, text, author, date,
            appVersion: r.version || null, url: r.url || null,
          });
        }
        collected += rows.length;
        token = res?.nextPaginationToken;
        if (!token) break;
        await sleep(350);
      } catch {
        break;
      }
    }
  }
  return out;
}

export async function scrapeAll(opts = {}) {
  const a = await scrapeAppStore(opts.appStore);
  const p = await scrapePlay(opts.play);
  return dedupe([...a, ...p].filter(isValidRawReview));
}
