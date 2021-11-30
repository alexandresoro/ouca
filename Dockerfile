# 1. Transpile the project
FROM node:14-alpine as build

WORKDIR /app/backend

RUN apk add git

COPY ./ /app/backend/

RUN git submodule init
RUN git submodule update

RUN npm ci
RUN npm run build

# 2. Run the NodeJS backend
FROM node:14-alpine

# Install only the dependencies that are required at runtime
WORKDIR /app

RUN apk add --no-cache mariadb-client

COPY package.json package-lock.json /app/ 
COPY prisma/ /app/prisma/

RUN npm ci --production && \
  rm -f package.json package-lock.json

WORKDIR /app/backend

COPY --from=build /app/backend/dist/ /app/backend/

ENTRYPOINT ["node", "backend.js", "--listenAddress", "0.0.0.0"]

EXPOSE 4000/tcp