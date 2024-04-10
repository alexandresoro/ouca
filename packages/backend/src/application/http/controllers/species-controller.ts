import {
  getSpeciesPaginatedResponse,
  getSpeciesQueryParamsSchema,
  getSpeciesResponse,
  speciesInfoSchema,
  upsertSpeciesInput,
  upsertSpeciesResponse,
} from "@ou-ca/common/api/species";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const speciesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { speciesService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const speciesResult = await speciesService.findSpecies(req.params.id, req.user);

    if (speciesResult.isErr()) {
      switch (speciesResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const species = speciesResult.value;

    if (!species) {
      return await reply.status(404).send();
    }

    const response = getSpeciesResponse.parse(species);
    return await reply.send(response);
  });

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id/info", async (req, reply) => {
    const speciesInfoResult = Result.combine([
      await speciesService.getEntriesCountBySpecies(`${req.params.id}`, {}, req.user),
      await speciesService.isSpeciesUsed(`${req.params.id}`, req.user),
    ]);

    if (speciesInfoResult.isErr()) {
      switch (speciesInfoResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    let totalEntriesCount: number | undefined = undefined;
    if (req.user?.permissions.canViewAllEntries) {
      // TODO: this should be better handled in the service
      const totalEntriesCountResult = await speciesService.getEntriesCountBySpecies(
        `${req.params.id}`,
        {},
        req.user,
        true,
      );

      if (totalEntriesCountResult.isErr()) {
        switch (totalEntriesCountResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      totalEntriesCount = totalEntriesCountResult.value;
    }

    const [ownEntriesCount, isSpeciesUsed] = speciesInfoResult.value;

    const response = speciesInfoSchema.parse({
      canBeDeleted: !isSpeciesUsed,
      ownEntriesCount,
      totalEntriesCount,
    });

    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getSpeciesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const { data: queryParams } = parsedQueryParamsResult;

    const paginatedResults = Result.combine([
      await speciesService.findPaginatedSpecies(req.user, queryParams),
      await speciesService.getSpeciesCount(req.user, queryParams),
    ]);

    if (paginatedResults.isErr()) {
      switch (paginatedResults.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const [data, count] = paginatedResults.value;

    const response = getSpeciesPaginatedResponse.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertSpeciesInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const speciesResult = await speciesService.createSpecies(input, req.user);

    if (speciesResult.isErr()) {
      switch (speciesResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
      }
    }

    const response = upsertSpeciesResponse.parse(speciesResult.value);
    return await reply.send(response);
  });

  fastify.put<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertSpeciesInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const speciesResult = await speciesService.updateSpecies(req.params.id, input, req.user);

    if (speciesResult.isErr()) {
      switch (speciesResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
      }
    }

    const response = upsertSpeciesResponse.parse(speciesResult.value);
    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedSpeciesResult = await speciesService.deleteSpecies(req.params.id, req.user);

    if (deletedSpeciesResult.isErr()) {
      switch (deletedSpeciesResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "isUsed":
          return await reply.status(409).send();
      }
    }

    const deletedSpecies = deletedSpeciesResult.value;

    if (!deletedSpecies) {
      return await reply.status(404).send();
    }

    return await reply.send({ id: deletedSpecies.id });
  });

  done();
};
