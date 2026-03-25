FROM oven/bun:1-alpine AS base
WORKDIR /monorepo

# Install dependencies (monorepo workspace — all package.json for lockfile consistency)
FROM base AS deps
COPY package.json bun.lock ./
COPY api/package.json api/package.json
COPY shared/package.json shared/package.json
COPY web/package.json web/package.json
COPY cli/package.json cli/package.json
COPY extension/package.json extension/package.json
COPY mcp/package.json mcp/package.json
RUN bun install --frozen-lockfile --production

# Runtime image
FROM base AS runner
WORKDIR /monorepo/api

# Copy workspace node_modules
COPY --from=deps /monorepo/node_modules /monorepo/node_modules
COPY --from=deps /monorepo/api/node_modules ./node_modules

# Copy source
COPY shared/ /monorepo/shared/
COPY api/ .

# Non-root user for security
RUN addgroup --system --gid 1001 pulse && \
    adduser --system --uid 1001 pulse
USER pulse

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD bun run -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["bun", "run", "src/index.ts"]
