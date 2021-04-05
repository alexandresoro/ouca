import * as http from "http";
import * as url from "url";
import * as zlib from "zlib";
import {
  REQUESTS_WITH_ATTACHMENT_FILE_NAME_RESPONSES, REQUEST_MAPPING,
  REQUEST_MEDIA_TYPE_RESPONSE_MAPPING
} from "../mapping";

export const handleHttpRequest = <T = unknown>(
  request: http.IncomingMessage,
  res: http.ServerResponse,
  postData?: T,
  inputFileName?: string
): void => {
  const jsonHttpHeader = "application/json";

  const pathName = url.parse(request.url).pathname;
  const queryParameters = url.parse(request.url, true).query;

  if (!(typeof REQUEST_MAPPING[pathName] === 'function')) {
    res.statusCode = 404;
    res.end();
    return;
  }

  REQUEST_MAPPING[pathName](
    {
      queryParameters,
      postData,
      inputFileName
    }
  )
    .then((result) => {
      res.statusCode = 200;
      let mediaTypeResponse: string;

      // Handle requests that will not return JSON
      if (REQUEST_MEDIA_TYPE_RESPONSE_MAPPING[pathName]) {
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
      zlib.gzip(resultToSend as zlib.InputType, (err, response) => { // TODO check how we can imrpve this without cast
        res.end(response);
      });
    })
    .catch((error: { nonFatal?: boolean }) => {
      console.error("Error:", error);
      res.statusCode = error?.nonFatal ? 200 : 500;
      res.end(JSON.stringify(error));
      // process.exit();
    });
};

export const isMultipartContent = (request: http.IncomingMessage): boolean => {
  // In some calls, the data passed as POST parameters is not a pure JSON, but a form (e.g. import)
  if (!!request.headers && !!request.headers["content-type"]) {
    const contentType = request.headers["content-type"];
    const contentTypeElements: string[] = contentType.split(";").map((elt) =>
      elt.trim()
    );
    return contentTypeElements.includes("multipart/form-data");
  }
  return false;
};
