import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import type { Services } from "../../services/services.js";
import { getAccessToken } from "./access-token-utils.js";

export const userController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { userService, oidcService } = services;

  fastify.post("/create", async (req, reply) => {
    const accessTokenResult = getAccessToken(req);

    if (accessTokenResult.isErr()) {
      switch (accessTokenResult.error) {
        case "headerNotFound":
          return await reply.status(401).send("Authorization header is missing.");
        case "headerInvalidFormat":
          return await reply.status(401).send("Authorization header is invalid.");
      }
    }

    // Validate token
    const introspectionResultResult = await oidcService.introspectAccessTokenCached(accessTokenResult.value);

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
