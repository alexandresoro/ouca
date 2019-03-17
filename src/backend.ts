import * as http from "http";
import * as _ from "lodash";
import * as url from "url";
import { REQUEST_MAPPING } from "./mapping";

const MOCK_MODE_ARG = "-mocks";

const hostname = "127.0.0.1";
const port = 4000;

const jsonHttpHeader = "application/json";

const isMockDatabaseMode = _.includes(process.argv, MOCK_MODE_ARG);

if (isMockDatabaseMode) {
  console.log("Backend is working in mock mode");
}

// HTTP server
const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse) => {
    console.log(`Method ${req.method}, URL ${req.url}`);

    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.method === "OPTIONS") {
      // Because of CORS, when the UI is requesting a POST method with a JSON body, it will preflight an OPTIONS call
      res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
      res.setHeader("Access-Control-Max-Age", "86400");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
      );

      res.statusCode = 200;
      res.end();
    } else {
      const pathName = url.parse(req.url).pathname;

      if (!_.isFunction(REQUEST_MAPPING[pathName])) {
        res.statusCode = 404;
        res.end();
        return;
      }

      const responseCallback = (error, result) => {
        if (error) {
          console.error(error);
          process.exit();
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", jsonHttpHeader);
        res.end(JSON.stringify(result));
      };

      REQUEST_MAPPING[pathName](isMockDatabaseMode, responseCallback);
    }
  }
);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
