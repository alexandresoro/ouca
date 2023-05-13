import { type FastifyPluginCallback } from "fastify";
import { BEARER_PATTERN } from "../fastify/handle-authorization-hook.js";
import { EXTERNAL_PROVIDER_NAME } from "../services/oidc/zitadel-oidc-service.js";
import { type Services } from "../services/services.js";

const userController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { userService, zitadelOidcService } = services;

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
    const introspectionResult = await zitadelOidcService.introspectAccessToken(accessToken);

    if (!introspectionResult.active) {
      return await reply.status(401).send("Access token is not active.");
    }

    const { id } = await userService.createUser({
      extProvider: EXTERNAL_PROVIDER_NAME,
      extProviderUserId: introspectionResult.sub,
    });
    await reply.status(201).send({ id });
  });

  done();
};

export default userController;
