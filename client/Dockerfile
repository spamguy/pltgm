# Use Bun only for installation (preserves bun.lock).
FROM oven/bun:1.3-alpine AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

FROM node:24-alpine
WORKDIR /app
COPY --from=install /temp/dev/node_modules node_modules
COPY package.json vite.config.ts index.html .

# Bun's net.Socket doesn't implement destroySoon(), which Vite's WS proxy requires.
# Use Node runtime until this is fixed.
# See: https://github.com/oven-sh/bun/issues/24127

ENTRYPOINT ["node", "node_modules/.bin/vite"]
