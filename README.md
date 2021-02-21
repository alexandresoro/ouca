# Où ça ? - Base Naturaliste (backend)

This is the Node.js backend for _Où ça ?_ application.

## About the project

The aim of the _Où ça ?_ project is to provide naturalists an application where they can record and visualize their wildlife observations.

For more details about the application itself, please refer to the documentation of the frontend project.

## Getting Started

This project is a Node.js webserver that connects to an instance of a MariaDB database where the application data is stored.

### Related project

The frontend for _Où ça ?_ application which uses this backend:

- [Où ça ? (frontend)](https://github.com/ou-ca/ouca-frontend)

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
