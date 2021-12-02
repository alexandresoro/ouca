import { PluginDefinition } from 'apollo-server-core';
import cuid from 'cuid';
import { FastifyInstance } from "fastify";
import { logger } from "../utils/logger";

export const apolloRequestLogger: PluginDefinition = {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/require-await
  async requestDidStart(context) {

    context.logger = logger.child({ requestId: cuid() });
    context.logger.info({
      operationName: context.request.operationName,
      query: context.request.query,
      variables: context.request.variables,
    });

    return {

      // eslint-disable-next-line @typescript-eslint/require-await
      async didEncounterErrors({ logger, errors }) {
        errors.forEach((error) => logger.warn(error));
      },

      // eslint-disable-next-line @typescript-eslint/require-await
      async willSendResponse({ logger, response }) {
        logger.debug(response);
      }

    }
  },
};

export const fastifyAppClosePlugin = (app: FastifyInstance) => {
  return {
    // eslint-disable-next-line @typescript-eslint/require-await
    async serverWillStart() {
      return {
        async drainServer() {
          await app.close();
        },
      };
    },
  };
}