# 1. Transpile the project
FROM node:14-alpine as build

WORKDIR /app/backend

RUN apk add git

COPY ./ /app/backend/

RUN git submodule init
RUN git submodule update

RUN npm ci
RUN npm run build:prod

# 2. Run the NodeJS backend
FROM node:14-alpine

# Install only the dependencies that are required at runtime
WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm ci --production 
RUN rm -f package.json package-lock.json

ENV DB_HOST 127.0.0.1
ENV DB_PORT 3306
ENV DB_USER basenaturaliste
ENV DB_PASSWORD basenaturaliste

ENV LOG_LEVEL warn
ENV LOG_TO_FILE false

RUN apk add mariadb-client

WORKDIR /app/backend

COPY --from=build /app/backend/dist/ /app/backend/

CMD node backend.js --dbHost ${DB_HOST} --dbPort ${DB_PORT} --dbUser ${DB_USER} --dbPassword ${DB_PASSWORD} --logLevel ${LOG_LEVEL} --logToFile ${LOG_TO_FILE} --listenAddress "0.0.0.0"

EXPOSE 4000/tcp