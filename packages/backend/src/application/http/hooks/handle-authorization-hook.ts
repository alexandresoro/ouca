import type { OIDCIntrospectionResult } from "@domain/oidc/oidc-introspection.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import {
  getIntrospectionResultFromCache,
  storeIntrospectionResultInCache,
} from "@infrastructure/oidc/oidc-introspect-access-token.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Services } from "../../services/services.js";

declare module "fastify" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface FastifyRequest {
    user: LoggedUser | null;
  }
}

export const BEARER_PATTERN = /^Bearer (.+)$/;

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
  const cachedKeyResult = await getIntrospectionResultFromCache(accessToken);

  if (cachedKeyResult.isErr()) {
    return await reply.status(500).send();
  }

  const cachedKey = cachedKeyResult.value;

  let introspectionResult: OIDCIntrospectionResult;
  if (cachedKey != null) {
    // Retrieve result from cache
    introspectionResult = cachedKey;
  } else {
    // Introspect token if not present in cache
    const introspectionResultResult = await oidcService.introspectAccessToken(accessToken);

    if (introspectionResultResult.isErr()) {
      return await reply.status(500).send();
    }

    introspectionResult = introspectionResultResult.value;

    // Regardless of the outcome, store the result in cache
    await storeIntrospectionResultInCache(introspectionResult, accessToken);
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
