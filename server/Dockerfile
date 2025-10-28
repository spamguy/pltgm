FROM denoland/deno:alpine-2.5.4 AS base

FROM base AS install
WORKDIR /app
COPY . .

RUN apk update && apk add curl
RUN curl -L --output-dir assets --output english-words.txt https://raw.githubusercontent.com/deepin-community/scowl/master/final/english-words.70
RUN deno cache main.ts

# RUN mkdir -p /temp/prod
# COPY package.json bun.lock /temp/prod/
# RUN cd /temp/prod && bun install --frozen-lockfile --production

# FROM base AS prerelease
# COPY --from=install /temp/dev/node_modules node_modules
# COPY . .

# ENV NODE_ENV=production

# FROM base AS release
# COPY --from=install /temp/prod/node_modules node_modules
# COPY --from=prerelease /usr/src/app/index.ts .
# COPY --from=prerelease /usr/src/app/package.json .

USER deno
EXPOSE 8000/tcp
ENTRYPOINT [ "deno", "run", "--allow-all", "main.ts" ]

