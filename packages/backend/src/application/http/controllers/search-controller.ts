import { getSpeciesPaginatedResponse, getSpeciesQueryParamsSchema } from "@ou-ca/common/api/species";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const searchController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { speciesService } = services;

  fastify.get(
    "/species",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Species"],
        querystring: getSpeciesQueryParamsSchema,
      },
    },
    async (req, reply) => {
      if (req.query.fromAllUsers && !req.user?.permissions.canViewAllEntries) {
        return await reply.status(403).send();
      }

      // If we don't want to see all users' species, we need to filter by ownerId
      const reshapedQueryParams = {
        ...req.query,
        ownerId: req.query.fromAllUsers ? undefined : req.user?.id,
      };

      const paginatedResults = Result.combine([
        await speciesService.findPaginatedSpecies(req.user, reshapedQueryParams),
        await speciesService.getSpeciesCount(req.user, reshapedQueryParams),
      ]);

      if (paginatedResults.isErr()) {
        switch (paginatedResults.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const [speciesData, count] = paginatedResults.value;

      const response = getSpeciesPaginatedResponse.parse({
        data: speciesData,
        meta: getPaginationMetadata(count, req.query),
      });

      return await reply.send(response);
    },
  );

  done();
};
