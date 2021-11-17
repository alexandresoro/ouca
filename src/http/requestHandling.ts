import { FastifyReply, FastifyRequest, RequestGenericInterface } from "fastify";
import { ParsedUrlQuery } from "querystring";
import { logger } from "../utils/logger";
import { HttpParameters } from "./httpParameters";

const JSON_HTTP_HEADER = "application/json";

export interface RequestGeneric extends RequestGenericInterface {
  Querystring: ParsedUrlQuery
}

export const handleRequest = async (
  request: FastifyRequest<RequestGeneric>,
  res: FastifyReply,
  mapping: {
    handler: (
      httpParameters?: HttpParameters
    ) => Promise<unknown>,
  }
): Promise<void> => {
  try {
    const result = await mapping.handler(request);

    void res.type(JSON_HTTP_HEADER);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
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
