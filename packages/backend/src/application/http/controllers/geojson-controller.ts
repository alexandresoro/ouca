import { fastifyEtag } from "@fastify/etag";
import type { FastifyPluginAsync } from "fastify";
import type { Services } from "../../services/services.js";

export const geojsonController: FastifyPluginAsync<{
  services: Services;
}> = async (fastify, { services }) => {
  const { geojsonService } = services;

  await fastify.register(fastifyEtag, {
    algorithm: "sha256",
  });

  fastify.get("/localities.json", async (req, reply) => {
    const geoJsonLocalitiesResult = await geojsonService.getLocalities(req.user);

    if (geoJsonLocalitiesResult.isErr()) {
      switch (geoJsonLocalitiesResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    return await reply
      .header("Content-Type", "application/json; charset=utf-8")
      .cacheControl("private")
      .cacheControl("max-age", 300)
      .send(geoJsonLocalitiesResult.value);
  });
};
