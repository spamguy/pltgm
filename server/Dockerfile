FROM node:24.11-alpine AS base

FROM base AS install
WORKDIR /app

COPY --chown=node:node package*.json .
COPY assets assets
RUN npm install
RUN chown -R node:node node_modules

USER node
CMD [ "npm", "run", "dev" ]

