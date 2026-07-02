import { createHash } from 'node:crypto';

/**
 * Canonical Review shape (see docs/architecture.md §5).
 * @typedef {Object} Review
 * @property {string} id
 * @property {'app_store'|'play_store'|'reddit'} source
 * @property {'ios'|'android'|'web'} platform
 * @property {string} country
 * @property {number|null} rating
 * @property {string|null} title
 * @property {string} text
 * @property {string} author
 * @property {string} date            ISO 8601
 * @property {string|null} appVersion
 * @property {string|null} url
 * // enrichment fields added in Phase 2:
 * @property {string=} sentiment
 * @property {boolean=} discoveryRelated
 * @property {string[]=} frustrationThemes
 * @property {string|null=} jtbd
 * @property {string=} segment
 * @property {string=} summary
 */

/** Stable 12-char id from source + author + date + text prefix. */
export function makeId(source, author, date, text) {
  return createHash('sha1')
    .update(`${source}|${author}|${date}|${(text || '').slice(0, 50)}`)
    .digest('hex')
    .slice(0, 12);
}

/** Truncate/clean an author handle so we don't store more PII than needed. */
export function cleanAuthor(name) {
  if (!name) return 'anon';
  return String(name).slice(0, 40);
}

/** Coerce anything date-like to ISO; fall back to now if missing. */
export function toISO(d) {
  if (!d) return new Date().toISOString();
  const dt = d instanceof Date ? d : new Date(d);
  return isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString();
}

/** Minimal runtime validation of a raw (pre-enrichment) Review. */
export function isValidRawReview(r) {
  return (
    r &&
    typeof r.id === 'string' && r.id.length > 0 &&
    ['app_store', 'play_store', 'reddit'].includes(r.source) &&
    typeof r.text === 'string' && r.text.trim().length > 0 &&
    typeof r.date === 'string'
  );
}

/** Dedupe an array of reviews by id, keeping the first occurrence. */
export function dedupe(reviews) {
  const seen = new Map();
  for (const r of reviews) if (!seen.has(r.id)) seen.set(r.id, r);
  return [...seen.values()];
}
