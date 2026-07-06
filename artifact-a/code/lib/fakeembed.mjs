// Deterministic offline "embedding" for --dry-run validation only.
// Hashes tokens into a 1536-dim bag so shared words -> similar vectors.
// NOT semantic; just lets us validate retrieval plumbing without an API key.
export const DIM = 1536;

export function fakeEmbed(text) {
  const v = new Array(DIM).fill(0);
  const tokens = String(text).toLowerCase().match(/[a-z0-9]+/g) || [];
  for (const tok of tokens) {
    let h = 2166136261;
    for (let i = 0; i < tok.length; i++) {
      h ^= tok.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    v[Math.abs(h) % DIM] += 1;
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}
