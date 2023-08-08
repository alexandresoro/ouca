import { fastifyCaching } from "@fastify/caching";
import { type FastifyPluginAsync } from "fastify";
import { type Services } from "../services/services.js";
import { sha256 } from "../utils/crypto.js";

const geojsonController: FastifyPluginAsync<{
  services: Services;
}> = async (fastify, { services }) => {
  const { geojsonService } = services;

  await fastify.register(fastifyCaching, {
    privacy: fastifyCaching.privacy.PRIVATE,
    expiresIn: 300,
    serverExpiresIn: 300,
  });

  fastify.get("/localities.json", async (req, reply) => {
    const geoJsonLocalities = await geojsonService.getLocalities(req.user);
    const geoJsonLocalitiesStr = JSON.stringify(geoJsonLocalities);
    return await reply.etag(sha256(geoJsonLocalitiesStr)).send(geoJsonLocalitiesStr);
  });
};

export default geojsonController;
