# Build context must be the project root so server/src/common is accessible.

# Use Bun only for installation (preserves bun.lock).
FROM oven/bun:1.3-alpine AS install
RUN mkdir -p /temp/dev
COPY client/package.json client/bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Dev: use Node for Vite dev server.
# Bun's net.Socket doesn't implement destroySoon(), which Vite's WS proxy requires.
# See: https://github.com/oven-sh/bun/issues/24127
FROM node:24-alpine AS dev
WORKDIR /app
COPY --from=install /temp/dev/node_modules node_modules
COPY client/package.json client/vite.config.ts client/index.html ./
ENTRYPOINT ["node", "node_modules/.bin/vite"]

FROM oven/bun:1.3-alpine AS build
WORKDIR /app
RUN chown -R bun:bun /app
COPY --chown=bun:bun --from=install /temp/dev/node_modules node_modules
COPY --chown=bun:bun client/ .
# Matches the #common alias: ../server/src/common relative to /app/vite.config.ts → /server/src/common
COPY --chown=bun:bun server/src/common /server/src/common
USER bun
RUN bun run build-only

FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
