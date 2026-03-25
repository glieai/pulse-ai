FROM oven/bun:1-alpine AS base
WORKDIR /monorepo

# Install dependencies (monorepo workspace — all package.json for lockfile consistency)
FROM base AS deps
COPY package.json bun.lock ./
COPY web/package.json web/package.json
COPY shared/package.json shared/package.json
COPY api/package.json api/package.json
COPY cli/package.json cli/package.json
COPY extension/package.json extension/package.json
COPY mcp/package.json mcp/package.json
RUN bun install --frozen-lockfile

# Build SvelteKit
FROM deps AS builder
WORKDIR /monorepo/web
COPY shared/ /monorepo/shared/
COPY web/ .
RUN bun run build

# Production image — preserve monorepo paths so bun symlinks resolve correctly
FROM base AS runner
WORKDIR /monorepo/web

# SvelteKit bun adapter output
COPY --from=builder /monorepo/web/build ./build
COPY --from=builder /monorepo/web/package.json ./package.json
COPY --from=builder /monorepo/web/node_modules ./node_modules
COPY --from=builder /monorepo/node_modules /monorepo/node_modules

# Non-root user
RUN addgroup --system --gid 1001 pulse && \
    adduser --system --uid 1001 pulse
USER pulse

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD bun run -e "fetch('http://localhost:3000/').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

ENV NODE_ENV=production
CMD ["bun", "build/index.js"]
