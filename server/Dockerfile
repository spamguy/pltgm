FROM node:24.10-alpine AS base

FROM base AS install
WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm install
RUN chown -R node:node node_modules

COPY --chown=node:node . .

USER node
CMD [ "npm", "run", "dev" ]

