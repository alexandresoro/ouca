# 1. Transpile the project
FROM node:16-alpine3.16 as build

WORKDIR /app/backend

RUN apk add git

COPY ./ /app/backend/

RUN git submodule init
RUN git submodule update

RUN npm ci
RUN npm run build

# 2. Run the NodeJS backend
FROM node:16-alpine3.16
ENV NODE_ENV=production

# Install only the dependencies that are required at runtime
WORKDIR /app

ENV OUCA_LISTEN_ADDRESS 0.0.0.0

RUN apk add --no-cache mariadb-client

COPY prisma/ /app/prisma/
COPY package.json package-lock.json /app/ 

RUN npm ci --production && \
  rm -f package.json package-lock.json

WORKDIR /app/backend

COPY --from=build /app/backend/dist/ /app/backend/

ENTRYPOINT ["node", "backend.js"]

EXPOSE 4000/tcp
