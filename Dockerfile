# 1. Transpile the project
FROM node:lts-alpine as build

WORKDIR /app/basenaturaliste-backend

COPY basenaturaliste-model/ /app/basenaturaliste-model/
COPY basenaturaliste-backend/package.json basenaturaliste-backend/tsconfig.json basenaturaliste-backend/yarn.lock /app/basenaturaliste-backend/
COPY basenaturaliste-backend/src/ /app/basenaturaliste-backend/src

RUN yarn install
RUN yarn build

# 2. Use ncc to produce one single output file that includes the node_module deps
# Yes we could use ncc to directly work with the .ts files, however ncc uses an outdated tsc version, 
#  so we make sure that the project is transpiled with the version declared in the yarn.lock :-)
FROM node:lts-alpine as ncc

WORKDIR /app/backend

RUN yarn global add @zeit/ncc@*

COPY basenaturaliste-model/ /app/basenaturaliste-model/
COPY basenaturaliste-backend/package.json basenaturaliste-backend/yarn.lock /app/backend/

# Here we include the JS from the build step that was produced in dist/
COPY --from=build /app/basenaturaliste-backend/dist /app/backend/

RUN yarn install

RUN ncc build backend.js -o dist

# 3. Run the NodeJS backend serving the single JS that contains everything :-)
FROM node:lts-alpine

WORKDIR /app/backend

COPY --from=ncc /app/backend/dist/index.js /app/backend/

ENV DB_HOST 127.0.0.1
ENV DB_PORT 3306
ENV DB_USER basenaturaliste
ENV DB_PASSWORD basenaturaliste
ENV MOCKS false

CMD node index.js -mocks=${MOCKS} -dbHost=${DB_HOST} -dbPort=${DB_PORT} -dbUser=${DB_USER} -dbPassword=${DB_PASSWORD} -docker

EXPOSE 4000/tcp