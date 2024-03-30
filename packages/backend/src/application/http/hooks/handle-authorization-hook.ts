import type { LoggedUser } from "@domain/user/logged-user.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Services } from "../../services/services.js";
import { getAccessToken } from "../controllers/access-token-utils.js";

declare module "fastify" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface FastifyRequest {
    user: LoggedUser | null;
  }
}

export const handleAuthorizationHook = async (
  request: FastifyRequest,
  reply: FastifyReply,
  services: Services,
): Promise<void> => {
  const { oidcService } = services;

  const accessTokenResult = getAccessToken(request);

  if (accessTokenResult.isErr()) {
    switch (accessTokenResult.error) {
      case "headerNotFound":
        return await reply.status(401).send("Authorization header is missing.");
      case "headerInvalidFormat":
        return await reply.status(401).send("Authorization header is invalid.");
    }
  }

  const accessToken = accessTokenResult.value;

  const introspectTokenResult = await oidcService.introspectAccessTokenCached(accessToken);

  if (introspectTokenResult.isErr()) {
    return await reply.status(500).send();
  }

  const introspectionResult = introspectTokenResult.value;

  // Introspect token if not present in cache

  if (introspectTokenResult.isErr()) {
    return await reply.status(500).send();
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
