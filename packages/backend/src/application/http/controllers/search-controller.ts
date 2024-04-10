import { getSpeciesPaginatedResponse, getSpeciesQueryParamsSchema } from "@ou-ca/common/api/species";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const searchController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { speciesService } = services;

  fastify.get("/species", async (req, reply) => {
    const parsedQueryParamsResult = getSpeciesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const { data: queryParams } = parsedQueryParamsResult;

    if (queryParams.fromAllUsers && !req.user?.permissions.canViewAllEntries) {
      return await reply.status(403).send();
    }

    // If we don't want to see all users' species, we need to filter by ownerId
    const reshapedQueryParams = {
      ...queryParams,
      ownerId: queryParams.fromAllUsers ? undefined : req.user?.id,
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
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  done();
};
