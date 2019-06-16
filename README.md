# Base Naturaliste (backend)

This is the Node.js backend for Base Naturaliste application.

## About the project

The aim of the Base Naturaliste project is to provide naturalists a software where they can record and visualize their wildlife observations.

## Getting Started

This project is a Node.js webserver that connects to an instance of a MariaDB database where the Base Naturaliste data is stored.

It uses the MariaDB JavaScript driver to connect to the database.

### Dependencies and related projects

#### Dependencies

The project requires Node.js v10 or later.

The objects exchanged between the backend and the frontend are defined in a common model:

- [Base Naturaliste (model)](https://github.com/alexandresoro/basenaturaliste-model)

#### Related projects

The frontend for Base Naturaliste application which uses this backend:

- [Base Naturaliste (frontend)](https://github.com/alexandresoro/basenaturaliste-frontend)

### Run the project

The following options are available through yarn:

- **build** : Transpiles the TypeScript project to the _dist/_ output folder.
- **build:debug** : Same as **build** but with the TypeScript source maps.
- **start** : Starts the Node.js instance. Same as _node dist/backend_.
- **dev** : Builds the project and starts the Node.js instance.
- **debug** : Builds the project with the source maps and start the Node.js instance with debug activated. Same as **dev** with the debug.

Example:

```
yarn dev
```

### Deployment

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

- dbHost : the IP address or server name where the database is located (e.g. 10.0.0.77, basenaturaliste.com). _Default is 127.0.0.1_.
- dbPort : the port where the database is located. _Default is 3306_.
- dbUser : the user of the database. _Default is "basenaturaliste"_.
- dbPassword : the password to connect to the database. _Default is "basenaturaliste"_.

Example:

```
node $path_to_project$/dist/backend -dbHost=basenaturaliste.com -dbPassword=dbpwd
```

For implementation purpose, it is possible to start the webserver with mocked data through the _mocks_ option. With this option no call is done to the database.

Example:

```
node $path_to_project$/dist/backend -mocks
```

## Authors

- [Alexandre Soro](https://github.com/alexandresoro)
- [Camille Carrier](https://github.com/camillecarrier)
