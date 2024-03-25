import type { Town, TownExtended } from "@ou-ca/common/api/entities/town";
import {
  getTownResponse,
  getTownsExtendedResponse,
  getTownsQueryParamsSchema,
  getTownsResponse,
  upsertTownInput,
  upsertTownResponse,
} from "@ou-ca/common/api/town";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import { logger } from "../../../utils/logger.js";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

const townsController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { townService, departmentService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const townResult = await townService.findTown(req.params.id, req.user);

    if (townResult.isErr()) {
      switch (townResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: townResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const town = townResult.value;

    if (!town) {
      return await reply.status(404).send();
    }

    const response = getTownResponse.parse(town);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getTownsQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const paginatedResults = Result.combine([
      await townService.findPaginatedTowns(req.user, queryParams),
      await townService.getTownsCount(req.user, queryParams),
    ]);

    if (paginatedResults.isErr()) {
      switch (paginatedResults.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: paginatedResults.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const [townsData, count] = paginatedResults.value;

    let data: Town[] | TownExtended[] = townsData;
    if (extended) {
      data = await Promise.all(
        townsData.map(async (townData) => {
          // TODO look to optimize this request
          const department = (await departmentService.findDepartmentOfTownId(townData.id, req.user))._unsafeUnwrap();
          const localitiesCount = (await townService.getLocalitiesCountByTown(townData.id, req.user))._unsafeUnwrap();
          const entriesCount = (await townService.getEntriesCountByTown(townData.id, req.user))._unsafeUnwrap();
          return {
            ...townData,
            departmentCode: department?.code,
            localitiesCount,
            entriesCount,
          };
        }),
      );
    }

    const responseParser = extended ? getTownsExtendedResponse : getTownsResponse;
    const response = responseParser.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
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
        default:
          logger.error({ error: townCreateResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertTownResponse.parse(townCreateResult.value);
    return await reply.send(response);
  });

  fastify.put<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
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
        default:
          logger.error({ error: townUpdateResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertTownResponse.parse(townUpdateResult.value);
    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedTownResult = await townService.deleteTown(req.params.id, req.user);

    if (deletedTownResult.isErr()) {
      switch (deletedTownResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: deletedTownResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const deletedTown = deletedTownResult.value;

    if (!deletedTown) {
      return await reply.status(404).send();
    }

    return await reply.send({ id: deletedTown.id });
  });

  done();
};

export default townsController;
