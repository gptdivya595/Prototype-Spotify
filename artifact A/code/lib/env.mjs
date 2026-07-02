/** Load project-local environment files for CLI scripts. Next.js/Vercel load these natively. */
export function loadEnv() {
  if (process.env.OPENAI_API_KEY || typeof process.loadEnvFile !== 'function') return;
  for (const file of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(file);
    } catch {
      // Missing/malformed optional file; requireEnv provides the actionable error when needed.
    }
  }
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.startsWith('REPLACE')) {
    throw new Error(`Missing env ${name} — set it in .env.local (see .env.example).`);
  }
  return value;
}
