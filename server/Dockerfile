FROM node:24.13-alpine AS base
WORKDIR /app

FROM base AS install
COPY --chown=node:node package*.json .
COPY assets assets
RUN npm install
RUN chown -R node:node node_modules

FROM install AS dev
USER node
CMD ["npm", "run", "dev"]

FROM base AS prod
COPY --chown=node:node package*.json .
COPY assets assets
RUN npm ci --omit=dev
COPY --chown=node:node src src
USER node
CMD ["node", "--experimental-strip-types", "src/index.ts"]

