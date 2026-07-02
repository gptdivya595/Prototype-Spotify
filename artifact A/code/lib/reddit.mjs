/**
 * Reddit ingestion via the public JSON endpoint (no auth).
 * Fetches a thread's post + comments and normalises them to the Review shape.
 */
import { makeId, cleanAuthor, hashAuthor, toISO } from './review.mjs';

const UA = 'spotify-review-research/1.0 (fellowship research)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function jsonUrl(url) {
  const clean = url.split('?')[0].replace(/\/$/, '');
  return `${clean}.json?limit=500&raw_json=1&depth=10`;
}

function mkReview(thing, { subreddit, title = null }) {
  const d = thing.data || {};
  const text = (d.selftext || d.body || '').trim();
  if (!text || text === '[deleted]' || text === '[removed]') return null;
  const author = cleanAuthor(d.author);
  if (author === 'AutoModerator') return null;
  const date = toISO(d.created_utc ? d.created_utc * 1000 : null);
  const url = d.permalink ? `https://www.reddit.com${d.permalink}` : null;
  return {
    id: makeId('reddit', author, date, text),
    sourceReviewId: d.id ? String(d.id) : null,
    source: 'reddit',
    sourceType: thing.kind === 't3' ? 'post' : 'comment',
    platform: 'web',
    country: subreddit ? `r/${subreddit}` : 'global',
    language: null,
    rating: null,
    title,
    text,
    authorHash: hashAuthor('reddit', author),
    date,
    fetchedAt: new Date().toISOString(),
    appVersion: null,
    url,
  };
}

/** Parse a raw Reddit thread JSON array ([post listing, comments listing]) → Review[]. */
export function parseThread(data, { cap = 250 } = {}) {
  const postThing = data?.[0]?.data?.children?.[0];
  const subreddit = postThing?.data?.subreddit;
  const title = postThing?.data?.title || null;
  const out = [];
  const post = postThing ? mkReview(postThing, { subreddit, title }) : null;
  if (post) out.push(post);
  // comments carry their own title=null (only the post has a title)
  collectComments(data?.[1]?.data?.children, { subreddit }, out, cap);
  return out;
}

// Walk the comment forest (kind 't1'); ignore 'more' stubs.
function collectComments(children, ctx, out, cap) {
  for (const c of children || []) {
    if (out.length >= cap) return;
    if (c.kind !== 't1') continue;
    const r = mkReview(c, ctx);
    if (r) out.push(r);
    const replies = c.data?.replies;
    if (replies && typeof replies === 'object') {
      collectComments(replies.data?.children, ctx, out, cap);
    }
  }
}

/** Fetch one thread → Review[] (post + up to `cap` comments). */
export async function fetchThread(url, { cap = 250 } = {}) {
  const res = await fetch(jsonUrl(url), {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const data = await res.json();
  return parseThread(data, { cap });
}

/** Fetch many threads sequentially (polite delay). */
export async function fetchThreads(urls, opts = {}) {
  const all = [];
  for (const url of urls) {
    try {
      const rows = await fetchThread(url, opts);
      console.log(`  ${url.split('/comments/')[1]?.split('/')[0] || url}: ${rows.length}`);
      all.push(...rows);
      await sleep(1500);
    } catch (e) {
      console.warn(`  [reddit] ${e.message}`);
    }
  }
  return all;
}
