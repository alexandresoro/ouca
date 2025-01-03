import {
  getTownResponse,
  getTownsQueryParamsSchema,
  getTownsResponse,
  townInfoSchema,
  upsertTownInput,
  upsertTownResponse,
} from "@ou-ca/common/api/town";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const townsController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { townService, departmentService } = services;

  fastify.get(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        params: idParamAsNumberSchema,
      },
    },
    async (req, reply) => {
      const townResult = await townService.findTown(req.params.id, req.user);

      if (townResult.isErr()) {
        switch (townResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const town = townResult.value;

      if (!town) {
        return await reply.status(404).send();
      }

      const response = getTownResponse.parse(town);
      return await reply.send(response);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        params: idParamAsNumberSchema,
      },
    },
    async (req, reply) => {
      const townInfoResult = Result.combine([
        await townService.getEntriesCountByTown(`${req.params.id}`, req.user),
        await townService.isTownUsed(`${req.params.id}`, req.user),
        await townService.getLocalitiesCountByTown(`${req.params.id}`, req.user),
        await departmentService.findDepartmentOfTownId(`${req.params.id}`, req.user),
      ]);

      if (townInfoResult.isErr()) {
        switch (townInfoResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const [ownEntriesCount, isTownUsed, localitiesCount, department] = townInfoResult.value;

      if (!department) {
        return await reply.status(404).send();
      }

      const response = townInfoSchema.parse({
        canBeDeleted: !isTownUsed,
        ownEntriesCount,
        departmentCode: department.code,
        localitiesCount,
      });

      return await reply.send(response);
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        querystring: getTownsQueryParamsSchema,
      },
    },
    async (req, reply) => {
      const parsedQueryParamsResult = getTownsQueryParamsSchema.safeParse(req.query);

      if (!parsedQueryParamsResult.success) {
        return await reply.status(422).send(parsedQueryParamsResult.error.issues);
      }

      const { data: queryParams } = parsedQueryParamsResult;

      const paginatedResults = Result.combine([
        await townService.findPaginatedTowns(req.user, queryParams),
        await townService.getTownsCount(req.user, queryParams),
      ]);

      if (paginatedResults.isErr()) {
        switch (paginatedResults.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const [data, count] = paginatedResults.value;

      const response = getTownsResponse.parse({
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
        tags: ["Location"],
        body: upsertTownInput,
      },
    },
    async (req, reply) => {
      const parsedInputResult = upsertTownInput.safeParse(req.body);

      if (!parsedInputResult.success) {
        return await reply.status(422).send();
      }

      const { data: input } = parsedInputResult;

      const townCreateResult = await townService.createTown(input, req.user);

      if (townCreateResult.isErr()) {
        switch (townCreateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertTownResponse.parse(townCreateResult.value);
      return await reply.send(response);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        params: idParamAsNumberSchema,
        body: upsertTownInput,
      },
    },
    async (req, reply) => {
      const parsedInputResult = upsertTownInput.safeParse(req.body);

      if (!parsedInputResult.success) {
        return await reply.status(422).send();
      }

      const { data: input } = parsedInputResult;

      const townUpdateResult = await townService.updateTown(req.params.id, input, req.user);

      if (townUpdateResult.isErr()) {
        switch (townUpdateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertTownResponse.parse(townUpdateResult.value);
      return await reply.send(response);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        params: idParamAsNumberSchema,
      },
    },
    async (req, reply) => {
      const deletedTownResult = await townService.deleteTown(req.params.id, req.user);

      if (deletedTownResult.isErr()) {
        switch (deletedTownResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "isUsed":
            return await reply.status(409).send();
        }
      }

      const deletedTown = deletedTownResult.value;

      if (!deletedTown) {
        return await reply.status(404).send();
      }

      return await reply.send({ id: deletedTown.id });
    },
  );

  done();
};
