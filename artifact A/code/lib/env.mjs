import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Module-relative root (works for CLI). We also check process.cwd() because once the
// Next.js bundler rewrites import.meta.url, the module-relative path no longer resolves.
const MODULE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Load .env.local / .env from cwd and the module root using Node's built-in loader. */
export function loadEnv() {
  const roots = [process.cwd(), MODULE_ROOT];
  for (const root of roots) {
    for (const f of ['.env.local', '.env']) {
      const p = join(root, f);
      if (existsSync(p)) {
        try {
          process.loadEnvFile(p);
        } catch {
          /* ignore malformed / already-loaded */
        }
      }
    }
  }
}

export function requireEnv(name) {
  const v = process.env[name];
  if (!v || v.startsWith('REPLACE')) {
    throw new Error(`Missing env ${name} — set it in .env.local (see .env.example).`);
  }
  return v;
}
