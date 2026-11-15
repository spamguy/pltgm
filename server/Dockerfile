FROM oven/bun:1.4-alpine AS base

# sqlite CLI for debugging only; the server uses the built-in bun:sqlite.
RUN apk add --no-cache sqlite

# Create SQLite directory to mount.
RUN mkdir -p /data && chown bun:bun /data

WORKDIR /app

FROM base AS install
COPY --chown=bun:bun package.json bun.lock ./
COPY assets assets
RUN bun install --frozen-lockfile
RUN chown -R bun:bun node_modules

FROM install AS dev
USER bun
CMD ["bun", "run", "mock"]

FROM base AS prod
COPY --chown=bun:bun package.json bun.lock ./
COPY assets assets
RUN bun install --frozen-lockfile --production
COPY --chown=bun:bun src src
USER bun
CMD ["bun", "src/index.ts"]
