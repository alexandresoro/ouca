# 1. Transpile the project
FROM node:18-alpine as build

WORKDIR /app/backend

RUN apk add git

COPY ./ /app/backend/

RUN git submodule init
RUN git submodule update

RUN npm ci
RUN npm run build

# 2. Run the NodeJS backend
FROM node:18-alpine
ENV NODE_ENV=production

# Install only the dependencies that are required at runtime
WORKDIR /app

ENV OUCA_LISTEN_ADDRESS 0.0.0.0

RUN apk add --no-cache mariadb-client

COPY prisma/ /app/prisma/
COPY package.json package-lock.json /app/ 

RUN npm set-script prepare "" && \
  npm set-script generate-graphql "" && \
  npm ci --production && \
  rm -f package.json package-lock.json

WORKDIR /app/backend

COPY --from=build /app/backend/dist/ /app/backend/

# Create the necessary directories
RUN mkdir public && \
  mkdir uploads && \
  mkdir logs

ENTRYPOINT ["node", "backend.js"]

EXPOSE 4000/tcp
