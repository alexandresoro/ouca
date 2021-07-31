import cors from "cors";
import express, { RequestHandler } from "express";
import { DELETE, GET, POST } from "./http/httpMethod";
import { handleRequest } from "./http/requestHandling";
import { REQUEST_MAPPING } from "./mapping";
import { WebsocketImportRequestMessage } from "./model/websocket/websocket-import-request-message";
import { HEARTBEAT, IMPORT, INIT } from "./model/websocket/websocket-message-type.model";
import { WebsocketMessage } from "./model/websocket/websocket-message.model";
import { importWebsocket } from "./requests/import";
import { logger } from "./utils/logger";
import { options } from "./utils/options";
import { WebsocketServer } from "./ws/websocket-server";
import { sendInitialData } from "./ws/ws-messages";

const app = express();

// CORS
app.use(cors());
app.options('*', cors());

// Parse JSON bodies
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  logger.info(`Method ${req.method}, URL ${req.url}`);
  next()
});

// Routes
Object.entries(REQUEST_MAPPING).forEach(([route, mapping]) => {

  const routeHandler: RequestHandler<unknown, unknown, unknown, Record<string, string | string[]>> = (req, res) => {
    handleRequest(req, res, mapping);
  }

  switch (mapping.method) {
    case GET:
      app.get(route, routeHandler);
      break;
    case POST:
      app.post(route, routeHandler);
      break;
    case DELETE:
      app.delete(route, routeHandler);
      break;
    default:
      app.all(route, routeHandler);
      break;
  }

});

// 404
app.use((req, res) => {
  res.status(404).send();
});

// HTTP server
const httpServer = app.listen(options.listenPort, options.listenAddress, () => {
  logger.info(`Server running at http://${options.listenAddress}:${options.listenPort}/`);
});

// Websocket
const wss = WebsocketServer.createServer(httpServer);

wss.on("connection", (client) => {
  client.on("message", (data): void => {
    const message = JSON.parse(data.toString()) as WebsocketMessage;
    if (message.type === HEARTBEAT) {
      logger.debug("Ping received");
      // Ping message received
      WebsocketServer.sendMessageToClients(
        JSON.stringify({
          type: "other",
          content: "pong"
        }),
        client
      );
    } else if (message.type === INIT) {
      // Client requests the initial configuration
      logger.info("Sending initial data to client");
      sendInitialData(client).catch((error) => { logger.error(error) });
    } else if (message.type === IMPORT) {
      // Import message received
      const importRequest = (message as WebsocketImportRequestMessage).content;
      logger.info(`Import requested by the client for table ${importRequest.dataType}`);
      logger.debug(`Import content is ${importRequest.data}`);
      importWebsocket(client, importRequest)
        .catch((error) => { logger.error(error) });
    }
  });
});

// Handle shutdown request gracefully
// This is used when inside a container
// See https://emmer.dev/blog/you-don-t-need-an-init-system-for-node.js-in-docker/
// Alternative is to use --init flag
const shutdown = () => {
  logger.info("Shutdown requested");
  httpServer.close(() => {
    logger.info("Web server has been shut down");
    wss.close(() => {
      logger.info("WebSocket server has been shut down");
      process.exit(0);
    });
  });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);