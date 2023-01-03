# 1. Transpile the project
FROM node:18-alpine as build

WORKDIR /app

RUN apk add git

COPY ./ /app/

RUN git submodule init
RUN git submodule update

RUN npm ci
RUN npm run backend build

# 2. Run the NodeJS backend
FROM node:18-alpine
ENV NODE_ENV=production

# Install only the dependencies that are required at runtime
WORKDIR /app

ENV OUCA_SERVER_HOST 0.0.0.0

COPY migrations/ /app/migrations/
COPY package.json package-lock.json /app/ 

RUN npm pkg delete scripts.prepare && \
  npm --workspace=packages/backend pkg delete scripts.postinstall && \
  npm ci && \
  rm -f package-lock.json

COPY --from=build /app/packages/ /app/packages/

WORKDIR /app/packages/backend/dist

# Create the necessary directories
RUN mkdir public && \
  mkdir uploads && \
  mkdir logs

ENTRYPOINT ["node", "main.js"]

EXPOSE 4000/tcp
