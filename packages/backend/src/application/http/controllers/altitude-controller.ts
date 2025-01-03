import { getAltitudeQueryParamsSchema, getAltitudeResponse } from "@ou-ca/common/api/altitude";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import type { Services } from "../../services/services.js";

export const altitudeController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { altitudeService } = services;

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],

        tags: ["Location"],
      },
    },
    async (req, reply) => {
      const parsedQueryParamsResult = getAltitudeQueryParamsSchema.safeParse(req.query);

      if (!parsedQueryParamsResult.success) {
        return await reply.unprocessableEntity();
      }

      const { data: queryParams } = parsedQueryParamsResult;

      const altitudeResult = await altitudeService.getAltitude(queryParams);

      if (altitudeResult.isErr()) {
        switch (altitudeResult.error) {
          case "coordinatesNotSupported":
            return await reply.notFound();
          case "fetchError":
            return await reply.internalServerError();
          case "parseError":
            return await reply.internalServerError();
        }
      }

      const response = getAltitudeResponse.parse(altitudeResult.value);

      return await reply.send(response);
    },
  );

  done();
};
