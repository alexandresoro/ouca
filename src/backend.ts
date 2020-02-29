import * as http from "http";
import * as multiparty from "multiparty";
import { handleHttpRequest, isMultipartContent } from "./http/requestHandling";

const DOCKER_ARG = "-docker";

const isDockerMode = process.argv.includes(DOCKER_ARG);

const hostname = isDockerMode ? "0.0.0.0" : "127.0.0.1";
const port = 4000;

// HTTP server
const server = http.createServer(
  (request: http.IncomingMessage, res: http.ServerResponse) => {
    console.log(`Method ${request.method}, URL ${request.url}`);

    res.setHeader("Access-Control-Allow-Origin", "*");
    // This header is used on client side to extract the file name for the SQL extract for example
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

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

        form.on("part", part => {
          if (part.filename) {
            part.on("data", chunk => {
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
        request.on("data", chunk => {
          chunks.push(chunk);
        });
        request.on("end", () => {
          const postData = JSON.parse(Buffer.concat(chunks).toString());
          handleHttpRequest(isDockerMode, request, res, postData);
        });
      }
    } else {
      handleHttpRequest(isDockerMode, request, res);
    }
  }
);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
