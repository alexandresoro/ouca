import { add, compareAsc } from "date-fns";
import { type FastifyReply, type FastifyRequest } from "fastify";
import { type ZitadelIntrospectionResult } from "../services/oidc/zitadel-oidc-service.js";
import { type Services } from "../services/services.js";

const BEARER_PATTERN = /^Bearer (.+)$/;

const ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_PREFIX = "accessTokenIntrospection";

const ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_DURATION = 3600; // 1h

const storeIntrospectionResultInCache = async (
  services: Services,
  key: string,
  introspectionResult: ZitadelIntrospectionResult,
  accessToken: string
) => {
  await services.redis.set(key, JSON.stringify(introspectionResult)).catch(() => {
    services.logger.warn(
      {
        accessToken,
      },
      "Storing token introspection result has failed."
    );
    return;
  });

  // Compute the TTL, it has to be the earliest between the cache duration and the expiration time, if active
  if (introspectionResult.active) {
    const tokenExpirationDate = new Date(introspectionResult.exp * 1000); // Token is in seconds
    const cacheExpirationDate = add(new Date(), { seconds: ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_DURATION });
    if (compareAsc(cacheExpirationDate, tokenExpirationDate) <= 0) {
      // Default cache duration is earlier than token duration
      await services.redis.expire(key, ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_DURATION);
    } else {
      // Token expires before the default duration
      await services.redis.expireat(key, introspectionResult.exp);
    }
  } else {
    // If token is not active, set the default duration
    await services.redis.expire(key, ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_DURATION);
  }
};

const handleAuthorizationHook = async (
  request: FastifyRequest,
  reply: FastifyReply,
  services: Services
): Promise<void> => {
  const { redis, zitadelOidcService } = services;

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

  let introspectionResult: ZitadelIntrospectionResult;
  if (cachedKey != null) {
    // Retrieve result from cache
    introspectionResult = JSON.parse(cachedKey) as ZitadelIntrospectionResult;
  } else {
    // Introspect token if not present in cache
    introspectionResult = await zitadelOidcService.introspectAccessToken(accessToken);
    // Regardless of the outcome, store the result in cache
    await storeIntrospectionResultInCache(services, redisKey, introspectionResult, accessToken);
  }

  if (!introspectionResult.active) {
    return await reply.status(401).send("Access token is not active.");
  }

  const matchingLoggedUserResult = await zitadelOidcService.getMatchingLoggedUser(introspectionResult);
  if (matchingLoggedUserResult.outcome === "notLogged") {
    switch (matchingLoggedUserResult.reason) {
      case "internalUserNotFound":
        return await reply.status(404).send("Application user not found");
      case "userHasNoRole":
        return await reply.status(403).send("User has no role");
    }
  }

  request.user = matchingLoggedUserResult.user;
};

export default handleAuthorizationHook;
