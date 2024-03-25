# syntax=docker/dockerfile:1
ARG NODE_IMAGE_VERSION=20

# 1. Transpile the project
FROM node:${NODE_IMAGE_VERSION}-alpine as build

WORKDIR /app

ARG PNPM_VERSION=latest
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY ./ /app/

RUN pnpm i --frozen-lockfile
RUN pnpm run backend build

# 2. Run the NodeJS backend
FROM node:${NODE_IMAGE_VERSION}-alpine as final

ARG PNPM_VERSION=latest
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

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

# Create the necessary directories
RUN mkdir public

ARG GIT_SHA
ENV SENTRY_RELEASE ${GIT_SHA}

ENTRYPOINT ["node", "main.js"]

EXPOSE 4000/tcp
