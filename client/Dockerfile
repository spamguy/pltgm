ARG NODE_VERSION=24.6.0-alpine

FROM node:${NODE_VERSION} AS dev

ENV NODE_ENV=development

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm install

COPY . .

# Change ownership to the node user.
RUN chown -R node:node /app
USER node

# Expose Vite eserver port.
EXPOSE 5173

# Use a default command, can be overridden in Docker compose.yml file
CMD [ "npm", "run", "dev", "--", "--host" ]

