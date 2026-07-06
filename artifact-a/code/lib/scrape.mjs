/**
 * Shared scraping logic used by scripts/scrape.mjs (bulk) and /api/ingest (bounded).
 */
import gplayImport from 'google-play-scraper';
import { makeId, cleanAuthor, hashAuthor, toISO, dedupe, isValidRawReview } from './review.mjs';

const gplay = gplayImport?.default ?? gplayImport;

export const APP_STORE_ID = 324684580;
export const PLAY_APP_ID = 'com.spotify.music';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchAppleFeed(country, page) {
  const url = `https://itunes.apple.com/${country}/rss/customerreviews/page=${page}`
    + `/id=${APP_STORE_ID}/sortby=mostrecent/json`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Apple RSS HTTP ${res.status}`);
  const json = await res.json();
  return (json?.feed?.entry || [])
    .filter((e) => e?.['im:rating']?.label && e?.content?.label)
    .map((e) => ({
      id: e.id?.label || null,
      userName: e.author?.name?.label || 'anon',
      updated: e.updated?.label || null,
      score: Number(e['im:rating']?.label),
      title: e.title?.label || null,
      text: e.content?.label || '',
      version: e['im:version']?.label || null,
      url: e.link?.attributes?.href || null,
    }));
}

export async function scrapeAppStore({ countries = ['us'], pages = 10 } = {}) {
  const out = [];
  for (const country of countries) {
    for (let page = 1; page <= pages; page++) {
      try {
        const rows = await fetchAppleFeed(country, page);
        if (!rows?.length) break;
        for (const r of rows) {
          const text = r.text || '';
          if (!text.trim()) continue;
          const date = toISO(r.updated);
          const author = cleanAuthor(r.userName);
          out.push({
            id: makeId('app_store', author, date, text),
            sourceReviewId: r.id ? String(r.id) : null,
            source: 'app_store', sourceType: 'review', platform: 'ios', country,
            language: null,
            rating: typeof r.score === 'number' ? r.score : null,
            title: r.title || null, text, authorHash: hashAuthor('app_store', author), date,
            fetchedAt: new Date().toISOString(),
            appVersion: r.version || null, url: r.url || null,
          });
        }
        await sleep(250);
      } catch (e) {
        console.warn(`  [app_store ${country} page ${page}] ${e.message}`);
        break;
      }
    }
  }
  return out;
}

export async function scrapePlay({ countries = ['us'], locales, num = 600 } = {}) {
  const out = [];
  const targets = locales || countries.map((country) => ({ country, lang: 'en' }));
  for (const { country, lang = 'en' } of targets) {
    let token, collected = 0, guard = 0;
    while (collected < num && guard < 20) {
      guard++;
      try {
        const res = await gplay.reviews({
          appId: PLAY_APP_ID, sort: gplay.sort.NEWEST,
          num: Math.min(150, num - collected), country, lang,
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
            sourceReviewId: r.id ? String(r.id) : null,
            source: 'play_store', sourceType: 'review', platform: 'android', country,
            language: lang,
            rating: typeof r.score === 'number' ? r.score : null,
            title: r.title || null, text, authorHash: hashAuthor('play_store', author), date,
            fetchedAt: new Date().toISOString(),
            appVersion: r.version || null, url: r.url || null,
          });
        }
        collected += rows.length;
        token = res?.nextPaginationToken;
        if (!token) break;
        await sleep(350);
      } catch (e) {
        console.warn(`  [play_store ${country}/${lang}] ${e.message}`);
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
