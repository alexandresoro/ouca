import { GraphQLRequestContext, GraphQLRequestContextWillSendResponse } from 'apollo-server-types';
import { FastifyInstance } from "fastify";
import { logger } from "../utils/logger";

export const apolloRequestLogger = {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/require-await
  async requestDidStart() {

    return {

      // eslint-disable-next-line @typescript-eslint/require-await
      async didEncounterErrors(requestContext: GraphQLRequestContext) {
        logger.warn(`GraphQL query has encountered the following error\n Request: ${JSON.stringify(requestContext.request, null, 2)}\n  Errors: ${JSON.stringify(requestContext.errors, null, 2)}`)
      },

      // eslint-disable-next-line @typescript-eslint/require-await
      async willSendResponse(
        requestContext: GraphQLRequestContextWillSendResponse<unknown>,
      ) {
        logger.debug(`GraphQL\n Request: ${JSON.stringify(requestContext.request, null, 2)}\n Response: ${JSON.stringify(requestContext.response, null, 2)}`)
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