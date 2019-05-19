import * as http from "http";
import * as _ from "lodash";
import * as url from "url";
import { REQUEST_MAPPING } from "../mapping";

export const handleHttpRequest = (
  isMockDatabaseMode: boolean,
  request: http.IncomingMessage,
  res: http.ServerResponse,
  postData?: any
): void => {
  const jsonHttpHeader = "application/json";

  const pathName = url.parse(request.url).pathname;
  const queryParameters = url.parse(request.url, true).query;

  if (!_.isFunction(REQUEST_MAPPING[pathName])) {
    res.statusCode = 404;
    res.end();
    return;
  }

  REQUEST_MAPPING[pathName](isMockDatabaseMode, {
    queryParameters,
    postData
  })
    .then((result) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", jsonHttpHeader);
      res.end(JSON.stringify(result));
    })
    .catch((error) => {
      console.error("Error:", error);
      res.statusCode = 500;
      res.end(JSON.stringify(error));
      // process.exit();
    });
};
