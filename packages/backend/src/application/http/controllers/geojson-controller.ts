import { fastifyCaching } from "@fastify/caching";
import type { FastifyPluginAsync } from "fastify";
import { sha256 } from "../../../utils/crypto.js";
import { logger } from "../../../utils/logger.js";
import type { Services } from "../../services/services.js";

export const geojsonController: FastifyPluginAsync<{
  services: Services;
}> = async (fastify, { services }) => {
  const { geojsonService } = services;

  await fastify.register(fastifyCaching, {
    privacy: fastifyCaching.privacy.PRIVATE,
    expiresIn: 300,
    serverExpiresIn: 300,
  });

  fastify.get("/localities.json", async (req, reply) => {
    const geoJsonLocalitiesResult = await geojsonService.getLocalities(req.user);

    if (geoJsonLocalitiesResult.isErr()) {
      switch (geoJsonLocalitiesResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: geoJsonLocalitiesResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const geoJsonLocalitiesStr = JSON.stringify(geoJsonLocalitiesResult.value);
    return await reply.etag(sha256(geoJsonLocalitiesStr)).send(geoJsonLocalitiesStr);
  });
};
