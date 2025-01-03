import {
  getClassResponse,
  getClassesQueryParamsSchema,
  getClassesResponse,
  speciesClassInfoSchema,
  upsertClassInput,
  upsertClassResponse,
} from "@ou-ca/common/api/species-class";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const classesController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { classService } = services;

  fastify.get<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],

        tags: ["Species"],
      },
    },
    async (req, reply) => {
      const speciesClassResult = await classService.findSpeciesClass(req.params.id, req.user);

      if (speciesClassResult.isErr()) {
        switch (speciesClassResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const speciesClass = speciesClassResult.value;

      if (!speciesClass) {
        return await reply.status(404).send();
      }

      const response = getClassResponse.parse(speciesClass);
      return await reply.send(response);
    },
  );

  fastify.get<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],

        tags: ["Species"],
      },
    },
    async (req, reply) => {
      const speciesClassInfoResult = Result.combine([
        await classService.getEntriesCountBySpeciesClass(`${req.params.id}`, req.user),
        await classService.isSpeciesClassUsed(`${req.params.id}`, req.user),
        await classService.getSpeciesCountBySpeciesClass(`${req.params.id}`, req.user),
      ]);

      if (speciesClassInfoResult.isErr()) {
        switch (speciesClassInfoResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const [ownEntriesCount, isSpeciesClassUsed, speciesCount] = speciesClassInfoResult.value;

      const response = speciesClassInfoSchema.parse({
        canBeDeleted: !isSpeciesClassUsed,
        ownEntriesCount,
        speciesCount,
      });

      return await reply.send(response);
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],

        tags: ["Species"],
      },
    },
    async (req, reply) => {
      const parsedQueryParamsResult = getClassesQueryParamsSchema.safeParse(req.query);

      if (!parsedQueryParamsResult.success) {
        return await reply.status(422).send(parsedQueryParamsResult.error.issues);
      }

      const { data: queryParams } = parsedQueryParamsResult;

      const paginatedResults = Result.combine([
        await classService.findPaginatedSpeciesClasses(req.user, queryParams),
        await classService.getSpeciesClassesCount(req.user, queryParams.q),
      ]);

      if (paginatedResults.isErr()) {
        switch (paginatedResults.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const [data, count] = paginatedResults.value;

      const response = getClassesResponse.parse({
        data,
        meta: getPaginationMetadata(count, queryParams),
      });

      return await reply.send(response);
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        security: [{ token: [] }],

        tags: ["Species"],
      },
    },
    async (req, reply) => {
      const parsedInputResult = upsertClassInput.safeParse(req.body);

      if (!parsedInputResult.success) {
        return await reply.status(422).send();
      }

      const { data: input } = parsedInputResult;

      const speciesClassCreateResult = await classService.createSpeciesClass(input, req.user);

      if (speciesClassCreateResult.isErr()) {
        switch (speciesClassCreateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertClassResponse.parse(speciesClassCreateResult.value);
      return await reply.send(response);
    },
  );

  fastify.put<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],

        tags: ["Species"],
      },
    },
    async (req, reply) => {
      const parsedInputResult = upsertClassInput.safeParse(req.body);

      if (!parsedInputResult.success) {
        return await reply.status(422).send();
      }

      const { data: input } = parsedInputResult;

      const speciesClassUpdateResult = await classService.updateSpeciesClass(req.params.id, input, req.user);

      if (speciesClassUpdateResult.isErr()) {
        switch (speciesClassUpdateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertClassResponse.parse(speciesClassUpdateResult.value);
      return await reply.send(response);
    },
  );

  fastify.delete<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],

        tags: ["Species"],
      },
    },
    async (req, reply) => {
      const deletedSpeciesClassResult = await classService.deleteSpeciesClass(req.params.id, req.user);

      if (deletedSpeciesClassResult.isErr()) {
        switch (deletedSpeciesClassResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "isUsed":
            return await reply.status(409).send();
        }
      }

      const deletedSpeciesClass = deletedSpeciesClassResult.value;

      if (!deletedSpeciesClass) {
        return await reply.status(404).send();
      }

      return await reply.send({ id: deletedSpeciesClass.id });
    },
  );

  done();
};
