# 1. Transpile the project
FROM node:16-alpine as build

WORKDIR /app

RUN apk add git

COPY ./ /app/

RUN git submodule init && \
  git submodule update

RUN npm ci
RUN GENERATE_SOURCEMAP=false npm run build

# 2. Build the webserver image along with the built project
FROM caddy

ENV DOMAIN_URL http://localhost
ENV BACKEND_HOST backend
ENV BACKEND_PORT 4000

EXPOSE 80 443

COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/build /srv
