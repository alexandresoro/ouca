# 1. Transpile the project
FROM node:lts-alpine as build

WORKDIR /app/backend

COPY package.json tsconfig.json yarn.lock /app/backend/
COPY src/ /app/backend/src

RUN yarn install --frozen-lockfile
RUN yarn build:prod

# 2. Run the NodeJS backend
FROM node:lts-alpine

# Install only the dependencies that are required at runtime
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install --production

ENV DB_HOST 127.0.0.1
ENV DB_PORT 3306
ENV DB_USER basenaturaliste
ENV DB_PASSWORD basenaturaliste

RUN apk add mariadb-client

WORKDIR /app/backend

COPY --from=build /app/backend/dist/ /app/backend/

CMD node backend.js --dbHost ${DB_HOST} --dbPort ${DB_PORT} --dbUser ${DB_USER} --dbPassword ${DB_PASSWORD} -docker

EXPOSE 4000/tcp