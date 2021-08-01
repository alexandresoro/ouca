import { fastify } from "fastify";
import fastifyCompress from "fastify-compress";
import fastifyCors from "fastify-cors";
import fastifyWebsocket from "fastify-websocket";
import middie from "middie";
import { DELETE, GET, POST } from "./http/httpMethod";
import { handleRequest, RequestGeneric } from "./http/requestHandling";
import { REQUEST_MAPPING } from "./mapping";
import { WebsocketImportRequestMessage } from "./model/websocket/websocket-import-request-message";
import { HEARTBEAT, IMPORT, INIT } from "./model/websocket/websocket-message-type.model";
import { WebsocketMessage } from "./model/websocket/websocket-message.model";
import { importWebsocket } from "./requests/import";
import { logger } from "./utils/logger";
import { options } from "./utils/options";
import { WebsocketServer } from "./ws/websocket-server";
import { sendInitialData } from "./ws/ws-messages";

const server = fastify();

(async () => {
  await server.register(middie);
  await server.register(fastifyWebsocket);
  await server.register(fastifyCompress);
  await server.register(fastifyCors, {
    origin: "*"
  });

  server.get('/ws/', { websocket: true }, (connection) => {
    connection.socket.on('message', data => {
      const message = JSON.parse(data.toString()) as WebsocketMessage;
      if (message.type === HEARTBEAT) {
        logger.debug("Ping received");
        // Ping message received
        WebsocketServer.sendMessageToClients(
          JSON.stringify({
            type: "other",
            content: "pong"
          }),
          connection.socket
        );
      } else if (message.type === INIT) {
        // Client requests the initial configuration
        logger.info("Sending initial data to client");
        sendInitialData(connection.socket).catch((error) => { logger.error(error) });
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
      method: mapping.method ?? [GET, POST, DELETE],
      url: route,
      handler: async (req, res) => {
        handleRequest(req, res, mapping).catch(e => res.send(e));
        await res;
      }
    });
  });

  // // 404
  // server.use((req, res) => {
  //   res.status(404).send();
  // });

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

})().catch(e => { /**/ });
