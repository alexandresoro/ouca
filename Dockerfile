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

ENV OUCA_LISTEN_ADDRESS 0.0.0.0

RUN apk add --no-cache mariadb-client

COPY package.json package-lock.json prisma/schema.prisma /app/ 

RUN npm ci --production 
RUN rm -f package.json package-lock.json
RUN rm -rf prisma/

WORKDIR /app/backend

COPY --from=build /app/backend/dist/ /app/backend/

ENTRYPOINT ["node", "backend.js"]

EXPOSE 4000/tcp
