import { fastifyEtag } from "@fastify/etag";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { Services } from "../../services/services.js";

export const geojsonController: FastifyPluginAsyncZod<{
  services: Services;
}> = async (fastify, { services }) => {
  const { geojsonService } = services;

  await fastify.register(fastifyEtag, {
    algorithm: "sha256",
  });

  fastify.get(
    "/localities.json",
    {
      schema: {
        security: [{ token: [] }],

        tags: ["Location"],
      },
    },
    async (req, reply) => {
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
    },
  );
};
