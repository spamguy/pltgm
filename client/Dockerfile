# For prod, use https://bun.com/docs/guides/ecosystem/docker
FROM oven/bun:1.3-alpine AS base
WORKDIR /app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Copy node_modules from temp directory.
FROM base AS prerelease
COPY --chown=bun:bun --from=install /temp/dev/node_modules node_modules
COPY package.json vite.config.ts index.html .

# Bun must own user-facing files and modules.
RUN chown -R bun:bun .

USER bun
ENTRYPOINT [ "bun", "run", "dev" ]
