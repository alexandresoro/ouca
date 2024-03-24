import type { OIDCIntrospectionResult } from "@domain/oidc/oidc-introspection.js";
import { redis } from "@infrastructure/ioredis/redis.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Services } from "../application/services/services.js";
import { logger } from "../utils/logger.js";

export const BEARER_PATTERN = /^Bearer (.+)$/;

const ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_PREFIX = "accessTokenIntrospection";

const ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_DURATION = 3600; // 1h

// TODO: Move that to a proper infrastructure
const storeIntrospectionResultInCache = async (
  key: string,
  introspectionResult: OIDCIntrospectionResult,
  accessToken: string,
) => {
  await redis.set(key, JSON.stringify(introspectionResult)).catch(() => {
    logger.warn(
      {
        accessToken,
      },
      "Storing token introspection result has failed.",
    );
    return;
  });

  // Compute the TTL, it has to be the earliest between the cache duration and the expiration time, if active
  if (introspectionResult.active) {
    const tokenExpirationDate = new Date(introspectionResult.user.exp * 1000); // Token is in seconds

    const cacheExpirationDate = new Date();
    cacheExpirationDate.setSeconds(cacheExpirationDate.getSeconds() + ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_DURATION);

    if (cacheExpirationDate <= tokenExpirationDate) {
      // Default cache duration is earlier than token duration
      await redis.expire(key, ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_DURATION);
    } else {
      // Token expires before the default duration
      await redis.expireat(key, introspectionResult.user.exp);
    }
  } else {
    // If token is not active, set the default duration
    await redis.expire(key, ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_DURATION);
  }
};

export const handleAuthorizationHook = async (
  request: FastifyRequest,
  reply: FastifyReply,
  services: Services,
): Promise<void> => {
  const { oidcService } = services;

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

  // Check if introspection result exists in cache
  const redisKey = `${ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_PREFIX}:${accessToken}`;
  const cachedKey = await redis.get(redisKey);

  let introspectionResult: OIDCIntrospectionResult;
  if (cachedKey != null) {
    // Retrieve result from cache
    introspectionResult = JSON.parse(cachedKey) as OIDCIntrospectionResult;
  } else {
    // Introspect token if not present in cache
    const introspectionResultResult = await oidcService.introspectAccessToken(accessToken);

    if (introspectionResultResult.isErr()) {
      return await reply.status(500).send();
    }

    introspectionResult = introspectionResultResult.value;

    // Regardless of the outcome, store the result in cache
    await storeIntrospectionResultInCache(redisKey, introspectionResult, accessToken);
  }

  if (!introspectionResult.active) {
    return await reply.status(401).send("Access token is not active.");
  }

  const matchingLoggedUserResult = await oidcService.getMatchingLoggedUser(introspectionResult.user);
  if (matchingLoggedUserResult.isErr()) {
    switch (matchingLoggedUserResult.error) {
      case "internalUserNotFound":
        return await reply.status(404).send("Application user not found");
      case "userHasNoRole":
        return await reply.status(403).send("User has no role");
    }
  }

  request.user = matchingLoggedUserResult.value;
};
