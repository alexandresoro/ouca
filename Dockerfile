# 1. Transpile the project
FROM node:14-alpine as build

WORKDIR /app/backend

COPY package.json tsconfig.json yarn.lock .yarnrc.yml /app/backend/
COPY .yarn/ /app/backend/.yarn
COPY src/ /app/backend/src

ARG NPM_GITHUB_TOKEN
RUN yarn install --immutable
RUN yarn build:prod

# 2. Run the NodeJS backend
FROM node:14-alpine

# Install only the dependencies that are required at runtime
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml /app/
COPY .yarn/ /app/.yarn

ARG NPM_GITHUB_TOKEN
RUN yarn workspaces focus --production 
RUN rm -f package.json yarn.lock .yarnrc.yml

ENV DB_HOST 127.0.0.1
ENV DB_PORT 3306
ENV DB_USER basenaturaliste
ENV DB_PASSWORD basenaturaliste

RUN apk add mariadb-client

WORKDIR /app/backend

COPY --from=build /app/backend/dist/ /app/backend/

CMD node backend.js --dbHost ${DB_HOST} --dbPort ${DB_PORT} --dbUser ${DB_USER} --dbPassword ${DB_PASSWORD} -docker

EXPOSE 4000/tcp