import { Prisma } from ".prisma/client";
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { ApolloServer } from "apollo-server-fastify";
import { fastify } from "fastify";
import fastifyCompress from "fastify-compress";
import fastifyCors from "fastify-cors";
import fastifyStatic from "fastify-static";
import fastifyWebsocket from "fastify-websocket";
import fs from "fs";
import middie from "middie";
import path from "path";
import { Logger } from "winston";
import { apolloRequestLogger, fastifyAppClosePlugin } from "./graphql/apollo-plugins";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typedefs";
import { DELETE, GET, POST } from "./http/httpMethod";
import { handleRequest, RequestGeneric } from "./http/requestHandling";
import { REQUEST_MAPPING, routes } from "./mapping";
import { WebsocketImportRequestMessage } from "./model/websocket/websocket-import-request-message";
import { HEARTBEAT, IMPORT } from "./model/websocket/websocket-message-type.model";
import { WebsocketMessage } from "./model/websocket/websocket-message.model";
import { importWebsocket } from "./requests/import";
import prisma from "./sql/prisma";
import { logger } from "./utils/logger";
import options from "./utils/options";
import { PUBLIC_DIR } from "./utils/paths";

const server = fastify();

const apolloServer = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  plugins: [
    fastifyAppClosePlugin(server),
    ApolloServerPluginDrainHttpServer({ httpServer: server.server }),
    apolloRequestLogger
  ]
});

// Prisma queries logger
const queriesLogger = (e: Prisma.QueryEvent | Prisma.LogEvent, winstonLogger: (message: string) => Logger) => {
  winstonLogger("\n" + JSON.stringify(e, null, 2));
}
prisma.$on('query', (e) => {
  queriesLogger(e, logger.debug);
});
prisma.$on('error', (e) => {
  queriesLogger(e, logger.error);
});
prisma.$on('warn', (e) => {
  queriesLogger(e, logger.warn);
});
prisma.$on('info', (e) => {
  queriesLogger(e, logger.info)
});

const PUBLIC_DIR_PATH = path.join(process.cwd(), PUBLIC_DIR);
const DOWNLOAD_PATH = "/download";

// Create a public dir if does not exist
// Used to serve some static content
if (!fs.existsSync(PUBLIC_DIR_PATH)) {
  fs.mkdirSync(PUBLIC_DIR_PATH);
}

(async () => {
  await server.register(middie);
  await server.register(fastifyWebsocket);
  await server.register(fastifyCompress);
  await server.register(fastifyCors, {
    origin: "*"
  });

  await server.register(fastifyStatic, {
    root: PUBLIC_DIR_PATH,
    prefix: DOWNLOAD_PATH
  });

  server.get('/ws/', { websocket: true }, (connection) => {
    connection.socket.on('message', data => {
      const message = JSON.parse(data.toString()) as WebsocketMessage;
      if (message.type === HEARTBEAT) {
        logger.debug("Ping received");
        // Ping message received
        connection.socket.send(JSON.stringify({
          type: "other",
          content: "pong"
        }))
      } else if (message.type === IMPORT) {
        // Import message received
        const importRequest = (message as WebsocketImportRequestMessage).content;
        logger.info(`Import requested by the client for table ${importRequest.dataType}`);
        logger.debug(`Import content is ${importRequest.data}`);
        importWebsocket(connection.socket, importRequest)
          .catch((error) => { logger.error(error) });
      }
    })
  })

  void server.use((req, res, next) => {
    logger.info(`Method ${req.method}, URL ${req.url}`);
    next()
  });

  // Routes
  Object.entries(REQUEST_MAPPING).forEach(([route, mapping]) => {
    server.route<RequestGeneric>({
      method: [GET, POST, DELETE],
      url: route,
      handler: async (req, res) => {
        handleRequest(req, res, mapping).catch(e => res.send(e));
        await res;
      }
    });
  });

  routes.forEach((route) => {
    server.route(route);
  });

  await apolloServer.start();
  void server.register(apolloServer.createHandler({
    path: 'graphql'
  }));

  server.listen(options.listenPort, options.listenAddress, (err, address) => {
    logger.info(`Server running at ${address}`);
  });

  // Handle shutdown request gracefully
  // This is used when inside a container
  // See https://emmer.dev/blog/you-don-t-need-an-init-system-for-node.js-in-docker/
  // Alternative is to use --init flag
  const shutdown = () => {
    logger.info("Shutdown requested");
    server.close(() => {
      logger.info("Web server has been shut down");
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

})().catch(e => { logger.error(e) });
