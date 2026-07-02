/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Ensure the committed serving artifacts ship with Vercel functions.
  outputFileTracingIncludes: {
    '/api/**/*': ['./data/vectors.json', './data/insights.json'],
  },
  // google-play-scraper is CommonJS with dynamic requires; use Node's native loader.
  serverExternalPackages: ['google-play-scraper'],
};

export default nextConfig;
