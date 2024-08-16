# syntax=docker/dockerfile:1@sha256:fe40cf4e92cd0c467be2cfc30657a680ae2398318afd50b0c80585784c604f28
ARG NODE_IMAGE_VERSION=20

# 1. Transpile the project
FROM node:${NODE_IMAGE_VERSION}-alpine as build

WORKDIR /app

RUN corepack enable

COPY ./ /app/

RUN pnpm i --frozen-lockfile
RUN pnpm run backend build

# 2. Run the NodeJS backend
FROM node:${NODE_IMAGE_VERSION}-alpine as final

RUN corepack enable

# Sets to production, it also sets the install script to install deps only
ENV NODE_ENV production

WORKDIR /app

# In the container, listen to outside localhost by default
ENV OUCA_SERVER_HOST 0.0.0.0

COPY /packages/backend/migrations/ packages/backend/migrations/

COPY package.json pnpm-*.yaml ./

COPY /packages/common/package.json packages/common/package.json
COPY /packages/backend/package.json packages/backend/package.json

RUN pnpm i --frozen-lockfile

COPY --from=build /app/packages/common/dist/ packages/common/dist/
COPY --from=build /app/packages/backend/dist/ packages/backend/dist/

WORKDIR /app/packages/backend/dist

ARG GIT_SHA
ENV SENTRY_RELEASE ${GIT_SHA}

ENTRYPOINT ["node", "--import", "@sentry/node/preload", "main.js"]

EXPOSE 4000/tcp
