import { getMeResponse } from "@ou-ca/common/api/me";
import type { FastifyPluginCallback } from "fastify";
import type { Services } from "../../services/services.js";
import { getAccessToken } from "./access-token-utils.js";

export const meController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { oidcService } = services;

  fastify.get("/", async (req, reply) => {
    if (!req.user) {
      return await reply.status(401).send();
    }

    const accessTokenResult = getAccessToken(req);

    if (accessTokenResult.isErr()) {
      switch (accessTokenResult.error) {
        case "headerNotFound":
          return await reply.status(401).send("Authorization header is missing.");
        case "headerInvalidFormat":
          return await reply.status(401).send("Authorization header is invalid.");
      }
    }

    const introspectionResult = await oidcService.introspectAccessTokenCached(accessTokenResult.value);

    if (introspectionResult.isErr()) {
      return await reply.status(500).send();
    }

    const introspectionData = introspectionResult.value;

    if (!introspectionData.active) {
      return await reply.status(401).send("Access token is not active.");
    }

    const oidcUser = introspectionData.user;

    const userResult = await oidcService.findLoggedUserFromProvider(oidcUser.oidcProvider, oidcUser.sub);

    if (userResult.isErr()) {
      return await reply.status(404).send("Internal user not found");
    }

    const { id } = userResult.value;

    const responseBody = getMeResponse.parse({
      id,
      user: introspectionData.user,
    });

    return await reply.send(responseBody);
  });

  done();
};
