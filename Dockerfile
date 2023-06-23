# syntax=docker/dockerfile:1
ARG HUSKY=0

# 1. Transpile the project
FROM node:18-alpine as build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.6.3 --activate

COPY ./ /app/

RUN pnpm i --frozen-lockfile
RUN pnpm run backend build

# 2. Run the NodeJS backend
FROM node:18-alpine
ENV NODE_ENV=production

# Install only the dependencies that are required at runtime
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.6.3 --activate

ENV OUCA_SERVER_HOST 0.0.0.0

COPY migrations/ /app/migrations/
COPY package.json pnpm-lock.yaml /app/

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN npm --workspaces pkg delete scripts.postinstall && \
  pnpm i --frozen-lockfile && \
  rm -f pnpm-lock.yaml

COPY --from=build /app/packages/ /app/packages/

WORKDIR /app/packages/backend/dist

# Create the necessary directories
RUN mkdir public && \
  mkdir uploads

ENTRYPOINT ["node", "main.js"]

EXPOSE 4000/tcp
