import * as http from "http";
import * as _ from "lodash";
import * as url from "url";
import * as zlib from "zlib";
import {
  REQUEST_MAPPING,
  REQUEST_MEDIA_TYPE_RESPONSE_MAPPING,
  REQUESTS_WITH_ATTACHMENT_FILE_NAME_RESPONSES
} from "../mapping";

export const handleHttpRequest = (
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

  REQUEST_MAPPING[pathName](
    {
      queryParameters,
      postData,
      inputFileName
    },
    isDockerMode
  )
    .then((result) => {
      res.statusCode = 200;
      let mediaTypeResponse: string;

      // Handle requests that will not return JSON
      if (!!REQUEST_MEDIA_TYPE_RESPONSE_MAPPING[pathName]) {
        mediaTypeResponse = REQUEST_MEDIA_TYPE_RESPONSE_MAPPING[pathName];
      } else {
        mediaTypeResponse = jsonHttpHeader;
      }
      res.setHeader("Content-Type", mediaTypeResponse);

      // Handle requests that will not return JSON but a file in attachment
      if (
        !!REQUEST_MEDIA_TYPE_RESPONSE_MAPPING[pathName] &&
        !!REQUESTS_WITH_ATTACHMENT_FILE_NAME_RESPONSES[pathName]
      ) {
        const fileName = REQUESTS_WITH_ATTACHMENT_FILE_NAME_RESPONSES[
          pathName
        ]();
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="' + fileName + '"'
        );
      }

      res.setHeader("Content-Encoding", "gzip");
      const resultToSend =
        mediaTypeResponse === jsonHttpHeader ? JSON.stringify(result) : result;
      zlib.gzip(resultToSend, (err, response) => {
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
