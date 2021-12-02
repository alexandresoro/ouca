import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { ApolloServer } from "apollo-server-fastify";
import { fastify } from "fastify";
import fastifyCompress from "fastify-compress";
import fastifyCors from "fastify-cors";
import fastifyStatic from "fastify-static";
import fastifyWebsocket from "fastify-websocket";
import fs from "fs";
import path from "path";
import { apolloRequestLogger, fastifyAppClosePlugin } from "./graphql/apollo-plugins";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typedefs";
import { WebsocketImportRequestMessage } from "./model/websocket/websocket-import-request-message";
import { HEARTBEAT, IMPORT } from "./model/websocket/websocket-message-type.model";
import { WebsocketMessage } from "./model/websocket/websocket-message.model";
import { importWebsocket } from "./services/import";
import prisma from "./sql/prisma";
import { logger } from "./utils/logger";
import options from "./utils/options";
import { PUBLIC_DIR } from "./utils/paths";

const server = fastify({
  logger
});

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
prisma.$on('query', (e) => {
  logger.trace(e);
});
prisma.$on('error', (e) => {
  logger.error(e);
});
prisma.$on('warn', (e) => {
  logger.warn(e);
});
prisma.$on('info', (e) => {
  logger.info(e)
});

const PUBLIC_DIR_PATH = path.join(process.cwd(), PUBLIC_DIR);
const DOWNLOAD_PATH = "/download";

// Create a public dir if does not exist
// Used to serve some static content
if (!fs.existsSync(PUBLIC_DIR_PATH)) {
  fs.mkdirSync(PUBLIC_DIR_PATH);
}

(async () => {

  // Middlewares
  await server.register(fastifyWebsocket);
  await server.register(fastifyCompress);
  await server.register(fastifyCors, {
    origin: "*"
  });

  // Static files server
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

  // GraphQL server
  await apolloServer.start();
  void server.register(apolloServer.createHandler({
    path: 'graphql',
    cors: false // Need to set to false otherwise it conflicts with the one defined as middleware above
  }));

  await server.listen(options.listenPort, options.listenAddress);

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
