# Où ça ? - Base Naturaliste

## About the project

The aim of the _Où ça ?_ project is to provide naturalists with an application where they can record and visualize their wildlife observations.

This project provides an API to interact with these observations - add new elements, edit them and so on.
This API is structured as a stateless microservice. It exposes a REST API and some parts as a GraphQL endpoint, and is agnostic of the integrator.

This project also provides a web application that consumes the API and allows a user-friendly representation of the data.

## Prerequisites

- _Node.js 18_ or later
- _pnpm 8_ or later
- PostgreSQL 15 or newer to store the data.
- A Redis instance used as temporary cache.
- An OIDC provider to provide authentication services. 

Most of the app is independent of the OIDC provider as it follows standard claims except for roles that are expected to be returned in specific claims. 
Hence, currently only [Zitadel](https://zitadel.com/) is supported, but additional providers could be easily added.

## API structure

Most of the API is exposed via a REST API available under `/api/v1/`.

A small part of the API is still only exposed via GraphQL on `/graphql` path.

The application exposes a static path at `/download`, that is to be used for two use cases: database exports and imports report files. The exact file paths are returned by their respective GraphQL actions.

Finally, the app exposes a single REST endpoint at `POST /uploads/:entityName` to allow users to import observations. This endpoint expects a single file as a multipart data body and will return an `uploadId` if valid.

## Authentication

The API require users to be authenticated.

Authentication is done using a separate OIDC provider.

On server side, a valid access token is expected in header `Authorization: Bearer xyzabc`.

The access token does not need to be a JWT token and can be an opaque one as introspection is performed server-side to validate the access token.

## Options

The following options are available as environment variables:

| Option                           |      Type       |                                        Default                                         | Description                                                                                                                                                                                                                                         |
| -------------------------------- | :-------------: | :------------------------------------------------------------------------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OUCA_SERVER_HOST`               |    `string`     |                                      `localhost`                                       | The address where the server listen to. See [Fastify docs](https://www.fastify.io/docs/latest/Reference/Server/#listen) for accepted values                                                                                                         |
| `OUCA_SERVER_PORT`               | `number (port)` |                                         `4000`                                         | The port used by the server                                                                                                                                                                                                                         |
| `OUCA_LOG_LEVEL`                 |    `string`     |                                         `warn`                                         | The log level of the server. Uses [Pino](https://github.com/pinojs/pino) logging levels                                                                                                                                                             |
| `DATABASE_URL`                   |    `string`     | `postgresql://` `basenaturaliste:basenaturaliste` `@127.0.0.1:5432/` `basenaturaliste` | The URL of the database to connect to                                                                                                                                                                                                               |
| `REDIS_URL` | `string`| `redis://localhost:6379/0` | The URL of the Redis instance to connect to. |
| `OUCA_DATABASE_RUN_MIGRATIONS`   |    `boolean`    |                                         `false`                                         | To enable or disable database migration scripts at startup. Default is `false` as it is expected to run migrations separately                                                                                                                                                                                          |
| `OUCA_DATABASE_MIGRATION_SCHEMA` |    `string`     |                                        `public`                                        | The name of the schema where to store the database migrations info                                                                                                                                                                                  |
| `OUCA_DATABASE_MIGRATION_TABLE`  |    `string`     |                          `base_naturaliste_umzug_migrations`                           | The name of the table where to store the database migrations info                                                                                                                                                                                   |
| `OUCA_DATABASE_MIGRATIONS_PATH`  |    `string`     |                                    Default migration folder path                                     | The path where the migration scripts are stored. Normally this should not need to be changed                                                                                                                                                        |
| `OIDC_ISSUER`* | `string` | none | The URL of the OIDC provider. |
| `OIDC_INTROSPECTION_PATH` | `string` | `/oauth/v2/introspect` | The path for introspection endpoint. |
| `OIDC_CLIENT_ID`* | `string` | none | Client ID to connect to OIDC. |
| `OIDC_CLIENT_SECRET`* | `string` | none | Client secret to connect to OIDC. The app implements the Client Credentials flow with Basic auth.|
| `SENTRY_DSN` | `string` | none | A [Sentry](https://sentry.io/) DSN used for error reporting |

Values with `*` are required and must be provided.

## Structure of an observation

An observation is materialized by the following characteristics:

- An observer and potential associate observers.
- The observation date with an optional time and duration.
- A location for the observation. It is structured with a "locality" that belongs to a "town" which itself belongs to a "department".
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
