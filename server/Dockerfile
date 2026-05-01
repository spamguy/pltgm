FROM node:24.15-alpine AS base

RUN apk add --no-cache sqlite

# Create SQLite directory to mount.
RUN mkdir -p /data && chown node:node /data

WORKDIR /app

FROM base AS install
COPY --chown=node:node package*.json ./
COPY assets assets
RUN npm install
RUN chown -R node:node node_modules

FROM install AS dev
USER node
CMD ["npm", "run", "mock"]

FROM base AS prod
COPY --chown=node:node package*.json ./
COPY assets assets
RUN npm ci --omit=dev
COPY --chown=node:node src src
USER node
CMD ["node", "--experimental-strip-types", "src/index.ts"]

