import type { FastifyPluginCallback } from "fastify";
import type { Services } from "../../services/services.js";
import { BEARER_PATTERN } from "../hooks/handle-authorization-hook.js";

export const userController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { userService, oidcService } = services;

  fastify.post("/create", async (req, reply) => {
    const authorizationHeader = req.headers.authorization;

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

    // Validate token
    const introspectionResultResult = await oidcService.introspectAccessToken(accessToken);

    if (introspectionResultResult.isErr()) {
      return await reply.status(500).send();
    }

    const introspectionResult = introspectionResultResult.value;

    if (!introspectionResult.active) {
      return await reply.status(401).send("Access token is not active.");
    }

    // Only user with active roles can create account
    const role = oidcService.getHighestRoleFromLoggedUser(introspectionResult.user);
    if (!role) {
      return await reply.status(403).send();
    }

    const { id } = await userService.createUser({
      extProvider: introspectionResult.user.oidcProvider,
      extProviderUserId: introspectionResult.user.sub,
    });
    await reply.status(201).send({ id });
  });

  done();
};
