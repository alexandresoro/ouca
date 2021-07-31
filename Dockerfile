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

RUN apk add mariadb-client

WORKDIR /app/backend

COPY --from=build /app/backend/dist/ /app/backend/

ENTRYPOINT ["node", "backend.js", "--listenAddress", "0.0.0.0"]

EXPOSE 4000/tcp