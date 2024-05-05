import { getAltitudeQueryParamsSchema, getAltitudeResponse } from "@ou-ca/common/api/altitude";
import type { FastifyPluginCallback } from "fastify";
import type { Services } from "../../services/services.js";

export const altitudeController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { altitudeService } = services;

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getAltitudeQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.unprocessableEntity();
    }

    const { data: queryParams } = parsedQueryParamsResult;

    const altitudeResult = await altitudeService.getAltitude(queryParams);

    if (altitudeResult.isErr()) {
      switch (altitudeResult.error) {
        case "fetchError":
          return await reply.internalServerError();
        case "parseError":
          return await reply.internalServerError();
      }
    }

    const response = getAltitudeResponse.parse(altitudeResult.value);

    return await reply.send(response);
  });

  done();
};
