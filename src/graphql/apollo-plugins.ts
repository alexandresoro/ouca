import { ApolloServerPlugin } from "apollo-server-plugin-base";
import { FastifyInstance } from "fastify";
import { GraphQLContext } from "./graphql-context";

export const apolloRequestLogger: ApolloServerPlugin<GraphQLContext> = {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/require-await
  async requestDidStart(context) {
    const logger = context.context.request.log.child({});
    logger.debug({
      operationName: context.request.operationName,
      query: context.request.query,
      variables: context.request.variables
    });

    return {
      // eslint-disable-next-line @typescript-eslint/require-await
      async didEncounterErrors({ errors }) {
        errors.forEach((error) => logger.info(error));
      },

      // eslint-disable-next-line @typescript-eslint/require-await
      async willSendResponse({ response }) {
        logger.trace(response);
      }
    };
  }
};

export const fastifyAppClosePlugin: (app: FastifyInstance) => ApolloServerPlugin = (app: FastifyInstance) => {
  return {
    // eslint-disable-next-line @typescript-eslint/require-await
    async serverWillStart() {
      return {
        async drainServer() {
          await app.close();
        }
      };
    }
  };
};
