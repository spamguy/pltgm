# For prod, use https://bun.com/docs/guides/ecosystem/docker
FROM oven/bun:1.3-alpine AS base
WORKDIR /usr/src/app

COPY --chown=bun:bun package*.json vite.config.ts .
COPY --chown=bun:bun . .
RUN bun install

USER bun
ENTRYPOINT [ "bun", "run", "dev" ]
