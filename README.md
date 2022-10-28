# Où ça ? - Base Naturaliste API

## About the project

The aim of the _Où ça ?_ project is to provide naturalists with an application where they can record and visualize their wildlife observations.

This project provides an API to interact with these observations - add new elements, edit them and so on.

This API is structured as a stateless microservice. It exposes a GraphQL and a small REST API, and is agnostic of the integrator.

## Prerequisites

- This project expects to be connected to a database instance. For now, only _MariaDB >= 10.6.9_ is supported.
- _Node.js 18_ or later
- _npm 8_ or later

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
Authentication is using a signed JWT `httpOnly` cookie.
On successful user login and signup actions, the server will send this cookie with key `token` in the HTTP response.
A logout action is exposed that will simply clear the cookie in the response to mimic a proper logout.

## Options

| Option                 |   Type    |      Default      | Description                                                                                                                                                                                                                                         |
| ---------------------- | :-------: | :---------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listenAddress`        | `string`  |    `127.0.0.1`    | The IP address where the server listen to                                                                                                                                                                                                           |
| `listenPort`           | `number`  |      `4000`       | The port used by the server                                                                                                                                                                                                                         |
| `logLevel`             | `string`  |      `warn`       | The log level of the server. Uses [Pino](https://github.com/pinojs/pino) logging levels                                                                                                                                                             |
| `logToFile`            | `boolean` |      `false`      | Logs to a file instead of the standard output. Log file location is `./logs/logfile.log`                                                                                                                                                            |
| `dbHost`               | `string`  |    `127.0.0.1`    | The address of the database to connect to                                                                                                                                                                                                           |
| `dbPort`               | `number`  |      `3306`       | The port of the database to connect to                                                                                                                                                                                                              |
| `dbUser`               | `string`  | `basenaturaliste` | The user account that connects to the database                                                                                                                                                                                                      |
| `dbPassword`           | `string`  | `basenaturaliste` | The password of the database user                                                                                                                                                                                                                   |
| `dbName`               | `string`  | `basenaturaliste` | The name of the database that contains the observations                                                                                                                                                                                             |
| `signupsAllowed`       | `boolean` |      `false`      | Set this value to true to enable creation of new accounts                                                                                                                                                                                           |
| `defaultAdminPassword` | `string`  |       none        | Password to be provided at user signup when no user exist. It allows the creation of an initial admin user. This is not used if any admin user already exists or if signups are disabled `signupsAllowed=false`                                     |
| `jwtSigningKey`        | `string`  |       none        | Allows to provide a user-defined signing key for the JWT token. This could be useful to be sure that cookies are valid between several API instances that share the same signing key. If not defined, a random signing key is used by the instance. |
| `jwtCookieSameSite`    | `boolean` |      `true`       | If true, the cookie that contains the token will have a `strict` same-site policy, and `none` otherwise.                                                                                                                                            |
| `jwtCookieSecure`      | `boolean` |      `true`       | If true, the cookie that contains the token can be only be used with HTTPS.                                                                                                                                                                         |

Each option can be passed as a CLI argument, and is also available as an environment variable with prefix `OUCA_` e.g. `OUCA_LISTEN_PORT`.

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
