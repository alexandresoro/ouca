FROM node:lts-alpine

WORKDIR /app/basenaturaliste-backend

COPY basenaturaliste-model/ /app/basenaturaliste-model/
COPY basenaturaliste-backend/package.json basenaturaliste-backend/tsconfig.json basenaturaliste-backend/yarn.lock /app/basenaturaliste-backend/
COPY basenaturaliste-backend/src/ /app/basenaturaliste-backend/src

RUN yarn install
RUN yarn build

ENV DB_HOST 127.0.0.1
ENV DB_PORT 3306
ENV DB_USER basenaturaliste
ENV DB_PASSWORD basenaturaliste
ENV MOCKS false

CMD node dist/backend -mocks=${MOCKS} -dbHost=${DB_HOST} -dbPort=${DB_PORT} -dbUser=${DB_USER} -dbPassword=${DB_PASSWORD} -docker ${EXTRA_PARAMS}

EXPOSE 4000/tcp