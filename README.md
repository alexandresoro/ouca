# Où ça ? - Base Naturaliste API

## About the project

The aim of the _Où ça ?_ project is to provide naturalists with an application where they can record and visualize their wildlife observations.

This project provides the API to interact with these observations - add new elements, edit them and so on.

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

## Prerequisites

This project expects to be connected to a database instance. For now, only _MariaDB >10.5_ is supported.

## Deployment

1. Build the project:

```
yarn build
```

This will generate the server files in the _dist/_ folder.

2. Start the webserver

Open your favorite terminal with Node.js already installed.
Assuming your _dist/_ folder is in the path $path_to_project$, run the following:

```
node $path_to_project$/dist/backend
```

This will start a local webserver on port 4000.

### Available options

When starting the webserver, it is possible to override the default configuration with the following options:

- **dbHost** : the IP address or server name where the database is located (e.g. 10.0.0.77, basenaturaliste.com). _Default is 127.0.0.1_.
- **dbPort** : the port where the database is located. _Default is 3306_.
- **dbUser** : the user of the database. _Default is "basenaturaliste"_.
- **dbPassword** : the password to connect to the database. _Default is "basenaturaliste"_.

Example:

```
node $path_to_project$/dist/backend --dbHost=basenaturaliste.com --dbPassword=dbpwd
```

## Docker

This project can be run as a Docker container.

A Dockerfile is provided, and will expose the backend on port 4000.

The database settings can be overridden with the following variables:

| Option     | Docker ENV variable |
| ---------- | :-----------------: |
| dbHost     |       DB_HOST       |
| dbPort     |       DB_PORT       |
| dbUser     |       DB_USER       |
| dbPassword |     DB_PASSWORD     |

## Authors

- [Alexandre Soro](https://github.com/alexandresoro)
- [Camille Carrier](https://github.com/camillecarrier)
