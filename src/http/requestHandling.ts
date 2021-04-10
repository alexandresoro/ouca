import { Request, Response } from "express";
import * as zlib from "zlib";
import { logger } from "../utils/logger";
import { HttpMethod } from "./httpMethod";
import { HttpParameters } from "./httpParameters";

const JSON_HTTP_HEADER = "application/json";

export const handleRequest = (
  request: Request<unknown, unknown, unknown, Record<string, string | string[]>>,
  res: Response<string | Buffer>,
  mapping: {
    method?: HttpMethod,
    handler: (
      httpParameters?: HttpParameters
    ) => Promise<unknown>,
    responseType?: string,
    responseAttachmentHandler?: () => string
  }
): void => {
  mapping.handler(request)
    .then((result) => {

      // Handle requests that will not return JSON and may return a file in attachment
      if (mapping.responseType) {
        if (mapping.responseAttachmentHandler) {
          const fileName = mapping.responseAttachmentHandler();
          res.attachment(fileName);
        } else {
          res.type(mapping.responseType);
        }
      } else {
        res.type(JSON_HTTP_HEADER);
      }

      res.status(200);

      const resultToSend = (!mapping.responseType) ? JSON.stringify(result) : result;
      zlib.gzip(resultToSend as zlib.InputType, (err, response) => { // TODO check how we can improve this without cast
        res.append("Content-Encoding", "gzip");
        res.send(response);
      });

    })
    .catch((error: { nonFatal?: boolean }) => {
      const { originalUrl, method, url, query } = request;
      const errorLogs = {
        request: { originalUrl, method, url, query },
        error
      }
      logger.error(`Error while treating the following request:\n${JSON.stringify(errorLogs, null, 2)}`);
      res.status(error?.nonFatal ? 200 : 500)
        .send(JSON.stringify(error));
    });
};
