import { type FastifyPluginAsync } from "fastify";
import { NoSchemaIntrospectionCustomRule } from "graphql";
import mercurius from "mercurius";
import { buildGraphQLContext } from "../graphql/graphql-context.js";
import { logQueries, logResults } from "../graphql/mercurius-logger.js";
import { buildResolvers } from "../graphql/resolvers.js";
import { type Services } from "../services/services.js";
import handleAuthorizationHook from "./handle-authorization-hook.js";

const graphQlServerPlugin: FastifyPluginAsync<{ schema: string; services: Services }> = async (
  fastify,
  { schema, services }
) => {
  // GraphQL needs authentication/authorization
  fastify.decorateRequest("user", null);
  fastify.addHook("onRequest", async (request, reply) => {
    await handleAuthorizationHook(request, reply, services);
  });

  await fastify.register(mercurius.default, {
    schema,
    resolvers: buildResolvers(services),
    context: buildGraphQLContext(),
    validationRules: process.env.NODE_ENV === "production" ? [NoSchemaIntrospectionCustomRule] : [],
  });

  fastify.graphql.addHook("preExecution", logQueries);
  fastify.graphql.addHook("onResolution", logResults);
};

export default graphQlServerPlugin;
