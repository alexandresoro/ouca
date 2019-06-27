import * as http from "http";
import * as _ from "lodash";
import * as url from "url";
import * as zlib from "zlib";
import { REQUEST_MAPPING } from "../mapping";

export const handleHttpRequest = (
  isMockDatabaseMode: boolean,
  isDockerMode: boolean,
  request: http.IncomingMessage,
  res: http.ServerResponse,
  postData?: any,
  inputFileName?: string
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
    postData,
    inputFileName
  }, isDockerMode)
    .then((result) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", jsonHttpHeader);
      res.setHeader("Content-Encoding", "gzip");
      zlib.gzip(JSON.stringify(result), (err, response) => {
        res.end(response);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      res.statusCode = 500;
      res.end(JSON.stringify(error));
      // process.exit();
    });
};

export const isMultipartContent = (request: http.IncomingMessage): boolean => {
  // In some calls, the data passed as POST parameters is not a pure JSON, but a form (e.g. import)
  if (!!request.headers && !!request.headers["content-type"]) {
    const contentType = request.headers["content-type"];
    const contentTypeElements: string[] = _.map(contentType.split(";"), (elt) =>
      elt.trim()
    );
    return _.includes(contentTypeElements, "multipart/form-data");
  }
  return false;
};
