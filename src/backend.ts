import {
  HEARTBEAT,
  IMPORT,
  TEXT, WebsocketMessage
} from "@ou-ca/ouca-model";
import * as http from "http";
import * as multiparty from "multiparty";
import { checkMethodValidity, OPTIONS, POST } from "./http/httpMethod";
import { handleHttpRequest, isMultipartContent } from "./http/requestHandling";
import { logger } from "./utils/logger";
import { WebsocketServer } from "./ws/websocket-server";
import { sendInitialData } from "./ws/ws-messages";

const DOCKER_ARG = "-docker";

const isDockerMode = process.argv.includes(DOCKER_ARG);

const hostname = isDockerMode ? "0.0.0.0" : "127.0.0.1";
const port = 4000;

// HTTP server
const server = http.createServer(
  (request: http.IncomingMessage, res: http.ServerResponse) => {
    logger.info(`Method ${request.method}, URL ${request.url}`);

    res.setHeader("Access-Control-Allow-Origin", "*");
    // This header is used on client side to extract the file name for the SQL extract for example
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    // Check if the method is allowed
    const isMethodValid = checkMethodValidity(request);
    if (!isMethodValid) {
      res.statusCode = 405;
      res.end();
      return;
    }

    if (request.method === OPTIONS) {
      // Because of CORS, when the UI is requesting a POST method with a JSON body, it will preflight an OPTIONS call
      res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
      res.setHeader("Access-Control-Max-Age", "86400");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
      );

      res.statusCode = 200;
      res.end();
    } else if (request.method === POST) {
      // Check if the request is a multipart content
      const isMultipartContentRequest: boolean = isMultipartContent(request);

      if (isMultipartContentRequest) {
        const form = new multiparty.Form();
        const chunksPart = [];

        form.on("part", (part) => {
          if (part.filename) {
            part.on("data", (chunk) => {
              chunksPart.push(chunk);
            });
            part.on("end", () => {
              const fileContent: string = Buffer.concat(chunksPart).toString();
              handleHttpRequest(
                isDockerMode,
                request,
                res,
                fileContent,
                part.filename
              );
            });
          } else {
            res.statusCode = 404;
            res.end();
            return;
          }
        });

        form.parse(request);
      } else {
        const chunks = [];
        request.on("data", (chunk) => {
          chunks.push(chunk);
        });
        request.on("end", () => {
          const postDataStr = Buffer.concat(chunks).toString();
          if (!postDataStr) {
            // If the request is a post without content, return a 400 error
            res.statusCode = 400;
            res.end();
            return;
          }
          const postData = JSON.parse(postDataStr);
          handleHttpRequest(isDockerMode, request, res, postData);
        });
      }
    } else {
      handleHttpRequest(isDockerMode, request, res);
    }
  }
);

const wss = WebsocketServer.createServer(server);

wss.on("connection", (client) => {
  client.on("message", (data): void => {
    const message = JSON.parse(data.toString()) as WebsocketMessage;
    logger.debug("Message received from websocket: " + JSON.stringify(message));
    if (message.type === HEARTBEAT) {
      // Ping message received
      WebsocketServer.sendMessageToClients(
        JSON.stringify({
          type: "other",
          content: "pong"
        }),
        client
      );
    } else if (message.type === TEXT && message.content === "init") {
      // Client requests the initial configuration
      logger.info("Sending initial data to client");
      void sendInitialData(client);
    } else if (message.type === IMPORT) {
      // Import message received
      logger.info("Import requested by the client");
      // TODO
    }
  });
});

server.listen(port, hostname, () => {
  logger.debug(`Server running at http://${hostname}:${port}/`);
});
