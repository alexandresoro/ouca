# Où ça ? - Base Naturaliste API

## About the project

The aim of the _Où ça ?_ project is to provide naturalists with an application where they can record and visualize their wildlife observations.

This project provides an API to interact with these observations - add new elements, edit them and so on.

This API is structured as a stateless microservice. It exposes a GraphQL and a small REST API, and is agnostic of the integrator.

## Prerequisites

- _Node.js 18_ or later
- _npm 8_ or later
- A database running PostgreSQL 14 or newer to store the data.

## Deployment

1. Install dependencies

```
npm ci
```

2. Start or build the project:

To start:

```
npm start
```

This will start the server on the default port.

To build:

```
npm run build
```

This will generate the output files in the _dist/_ folder.

## API structure

Most of the API is exposed via GraphQL on `/graphql` path.

The application exposes a static path at `/download`, that is to be used for two use cases: database exports and imports report files. The exact file paths are returned by their respective GraphQL actions.

Finally, the app exposes a single REST endpoint at `POST /uploads/:entityName` to allow users to import observations. This endpoint expects a single file as a multipart data body and will return an `uploadId` if valid.

## Authentication

(To be updated when complete)

Most of the accesses to the API require users to be authenticated.
Authentication is using a signed JWT cookie.
On successful user login and signup actions, the server will send this cookie with key `token` in the HTTP response.

A logout action is exposed that will simply clear the cookie in the response to mimic a proper logout.

## Options

The following options are available as environment variables:

| Option                        |      Type       |                                        Default                                         | Description                                                                                                                                                                                                                                         |
| ----------------------------- | :-------------: | :------------------------------------------------------------------------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OUCA_SERVER_HOST`            |    `string`     |                                      `localhost`                                       | The address where the server listen to. See [Fastify docs](https://www.fastify.io/docs/latest/Reference/Server/#listen) for accepted values                                                                                                         |
| `OUCA_SERVER_PORT`            | `number (port)` |                                         `4000`                                         | The port used by the server                                                                                                                                                                                                                         |
| `OUCA_LOG_LEVEL`              |    `string`     |                                         `warn`                                         | The log level of the server. Uses [Pino](https://github.com/pinojs/pino) logging levels                                                                                                                                                             |
| `OUCA_LOG_TO_FILE`            |    `boolean`    |                                        `false`                                         | Logs to a file on top of the standard output. Log file location is `./logs/logfile.log`                                                                                                                                                             |
| `OUCA_DATABASE_URL`           |    `string`     | `postgresql://` `basenaturaliste:basenaturaliste` `@127.0.0.1:5432/` `basenaturaliste` | The URL of the database to connect to                                                                                                                                                                                                               |
| `OUCA_SIGNUPS_ALLOWED`        |    `boolean`    |                                        `false`                                         | Set this value to true to enable creation of new accounts                                                                                                                                                                                           |
| `OUCA_DEFAULT_ADMIN_PASSWORD` |    `string`     |                                          none                                          | Password to be provided at user signup when no user exist. It allows the creation of an initial admin user. This has no effect if any admin user already exists or if signups are disabled `signupsAllowed=false`                                   |
| `OUCA_JWT_SIGNING_KEY`        |    `string`     |                                          none                                          | Allows to provide a user-defined signing key for the JWT token. This could be useful to be sure that cookies are valid between several API instances that share the same signing key. If not defined, a random signing key is used by the instance. |
| `OUCA_JWT_COOKIE_SAME_SITE`   |    `boolean`    |                                         `true`                                         | If true, the cookie that contains the token will have a `strict` same-site policy, and `none` otherwise.                                                                                                                                            |
| `OUCA_JWT_COOKIE_SECURE`      |    `boolean`    |                                         `true`                                         | If true, the cookie that contains the token can be only be used with HTTPS.                                                                                                                                                                         |

## Structure of an observation

An observation is materialized by the following characteristics:

- An observer and potential associate observers.
- The observation date with an optional time and duration.
- A location for the observation. It is structured with an "area" that belongs to a "city" which itself belongs to a "department".
- An optional temperature and weather characteristics.

The characteristics above are considered to be an inventory. An observation belongs to a single inventory, but an inventory can contain several observation, which represents a real use case where several observations can be made during the same session.

- A species and its related species class.
- An estimate on the number of species encountered.
- An estimate on the distance between the observer and the species observed.
- The age of the species encountered.
- The sex of the species encountered.
- An optional list of behaviors describing the state of the species.
- An optional list of environments surrounding the species.
- An optional comment on the observation.

## Authors

- [Alexandre Soro](https://github.com/alexandresoro)
- [Camille Carrier](https://github.com/camillecarrier)
