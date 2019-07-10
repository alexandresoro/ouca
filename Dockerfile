# 1. Transpile the project
FROM node:lts-alpine as build

WORKDIR /app/backend

# Add git as we need it to retrieve the model
RUN apk add git

RUN yarn global add @zeit/ncc@*

COPY package.json tsconfig.json yarn.lock /app/backend/
COPY src/ /app/backend/src

RUN yarn install
RUN yarn build

# 2. Use ncc to produce one single output file that includes the node_module deps
# Yes we could use ncc to directly work with the .ts files, however ncc uses an outdated tsc version, 
#  so we make sure that the project is transpiled with the version declared in the yarn.lock :-)
WORKDIR /app/backend/dist

RUN ncc build backend.js -o build

# 3. Run the NodeJS backend serving the single JS that contains everything :-)
FROM node:lts-alpine

WORKDIR /app/backend

COPY --from=build /app/backend/dist/build/index.js /app/backend/

ENV DB_HOST 127.0.0.1
ENV DB_PORT 3306
ENV DB_USER basenaturaliste
ENV DB_PASSWORD basenaturaliste
ENV MOCKS false

RUN apk add mariadb-client

CMD node index.js -mocks=${MOCKS} -dbHost=${DB_HOST} -dbPort=${DB_PORT} -dbUser=${DB_USER} -dbPassword=${DB_PASSWORD} -docker

EXPOSE 4000/tcp