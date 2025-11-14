# For prod, use https://bun.com/docs/guides/ecosystem/docker
FROM oven/bun:1.3-alpine AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Copy node_modules from temp directory. Bun must own TS files and modules.
FROM base AS prerelease
COPY --chown=bun:bun --from=install /temp/dev/node_modules node_modules
COPY --chown=bun:bun . .
RUN ls

USER bun
ENTRYPOINT [ "bun", "run", "dev" ]
