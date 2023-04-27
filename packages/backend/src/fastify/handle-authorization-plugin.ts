import { type FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import introspectAccessToken, { type IntrospectionResult } from "../services/oidc/introspect-access-token.js";
import { type Services } from "../services/services.js";

const BEARER_PATTERN = /^Bearer (.+)$/;

const ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_PREFIX = "accessTokenIntrospection";

const ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_DURATION = 3600; // 1h

const handleAuthorizationPlugin: FastifyPluginCallback<{ services: Services }> = (fastify, { services }, done) => {
  const { logger, redis } = services;

  fastify.addHook("onRequest", async (request, reply) => {
    const authorizationHeader = request.headers.authorization;

    // Return if authorization header is missing
    if (!authorizationHeader) {
      return await reply.status(401).send("Authorization header is missing.");
    }

    // Return if authorization header format is incorrect
    const bearerGroups = BEARER_PATTERN.exec(authorizationHeader);
    if (!bearerGroups) {
      return await reply.status(401).send("Authorization header is invalid.");
    }

    // Access token extracted
    const accessToken = bearerGroups[1];

    const redisKey = `${ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_PREFIX}:${accessToken}`;

    // Check if introspection result exists in cache
    const cachedKey = await redis.get(redisKey);

    let introspectionResult: IntrospectionResult;
    if (cachedKey != null) {
      // Retrieve result from cache
      introspectionResult = JSON.parse(cachedKey) as IntrospectionResult;
    } else {
      // Introspect token if not present in cache
      introspectionResult = await introspectAccessToken(accessToken);

      // Regardless of the outcome, store the result in cache
      await redis
        .set(redisKey, JSON.stringify(introspectionResult), "EX", ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_DURATION)
        .catch(() => {
          logger.warn(
            {
              accessToken,
            },
            "Storing token introspection result has failed."
          );
        });
    }

    if (!introspectionResult.active) {
      return await reply.status(401).send("Access token is not active.");
    }

    // TODO additional validation (e.g. check issuer, expire...)

    // TODO decorate and/or retrieve user from token
    console.log(introspectionResult);
  });

  done();
};

export default fp(handleAuthorizationPlugin);
