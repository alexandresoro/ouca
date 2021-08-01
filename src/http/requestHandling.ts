import { FastifyReply, FastifyRequest, RequestGenericInterface } from "fastify";
import { ParsedUrlQuery } from "querystring";
import { logger } from "../utils/logger";
import { HttpMethod } from "./httpMethod";
import { HttpParameters } from "./httpParameters";

const JSON_HTTP_HEADER = "application/json";

export interface RequestGeneric extends RequestGenericInterface {
  Querystring: ParsedUrlQuery
}

export const handleRequest = async (
  request: FastifyRequest<RequestGeneric>,
  res: FastifyReply,
  mapping: {
    method?: HttpMethod,
    handler: (
      httpParameters?: HttpParameters
    ) => Promise<unknown>,
    responseType?: string,
    responseAttachmentHandler?: () => string
  }
): Promise<void> => {
  try {
    const result = await mapping.handler(request);

    // Handle requests that will not return JSON and may return a file in attachment
    if (mapping.responseType) {
      if (mapping.responseAttachmentHandler) {
        const fileName = mapping.responseAttachmentHandler();
        void res.header("Content-Disposition", `attachment; filename="${fileName}"`);
      } else {
        void res.type(mapping.responseType);

      }
    } else {
      void res.type(JSON_HTTP_HEADER);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.compress(result as any);
  } catch (error) {
    const errorTyped = error as { nonFatal?: boolean };
    const { method, url, query } = request;
    const errorLogs = {
      request: { method, url, query },
      errorTyped
    }
    logger.error(`Error while treating the following request:\n${JSON.stringify(errorLogs, null, 2)}`);

    const errorMessage = JSON.stringify(errorTyped) ?? "";
    if (errorTyped?.nonFatal) {
      void res.send(errorMessage);
    } else {
      throw new Error(errorMessage);
    }
  }
};
