import * as http from "http";
import * as _ from "lodash";
import * as multiparty from "multiparty";
import { handleHttpRequest, isMultipartContent } from "./http/requestHandling";

const MOCK_MODE_ARG = "-mocks";

const hostname = "127.0.0.1";
const port = 4000;

const isMockDatabaseMode = process.argv.includes(MOCK_MODE_ARG);

if (isMockDatabaseMode) {
  console.log("Backend is working in mock mode");
}

// HTTP server
const server = http.createServer(
  (request: http.IncomingMessage, res: http.ServerResponse) => {
    console.log(`Method ${request.method}, URL ${request.url}`);

    res.setHeader("Access-Control-Allow-Origin", "*");

    if (request.method === "OPTIONS") {
      // Because of CORS, when the UI is requesting a POST method with a JSON body, it will preflight an OPTIONS call
      res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
      res.setHeader("Access-Control-Max-Age", "86400");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
      );

      res.statusCode = 200;
      res.end();
    } else if (request.method === "POST") {
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
                isMockDatabaseMode,
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
          const postData = JSON.parse(Buffer.concat(chunks).toString());
          handleHttpRequest(isMockDatabaseMode, request, res, postData);
        });
      }
    } else {
      handleHttpRequest(isMockDatabaseMode, request, res);
    }
  }
);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
