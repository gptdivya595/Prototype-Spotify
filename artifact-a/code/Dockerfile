# Artifact A — Spotify Review RAG (Next.js 16) on Cloud Run.
# Non-standalone build: install, `next build`, then `next start` on $PORT.
FROM node:20-slim

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Install deps first for layer caching. package-lock.json is committed.
COPY package.json package-lock.json ./
RUN npm ci

# App source + serving artifacts (data/vectors.json, data/insights.json).
# node_modules/.next/.env* are excluded via .dockerignore.
COPY . .

RUN npm run build

# Non-root runtime.
RUN useradd --create-home --uid 10001 nextjs \
    && chown -R nextjs:nextjs /app
USER nextjs

# Cloud Run injects PORT (default 8080). next start must bind it on 0.0.0.0.
EXPOSE 8080
CMD ["sh", "-c", "npx next start -p ${PORT:-8080} -H 0.0.0.0"]
