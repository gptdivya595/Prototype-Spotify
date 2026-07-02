/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // ensure the local vector store + insights files ship with serverless functions
    outputFileTracingIncludes: {
      '/api/**/*': ['./data/vectors.json', './data/insights.json'],
    },
    // scraper libs are CJS with dynamic requires — keep them external to the bundler
    serverComponentsExternalPackages: ['app-store-scraper', 'google-play-scraper'],
  },
};

export default nextConfig;
