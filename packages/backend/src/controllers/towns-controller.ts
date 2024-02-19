import { OucaError } from "@domain/errors/ouca-error.js";
import { type Town, type TownExtended } from "@ou-ca/common/api/entities/town";
import {
  getTownResponse,
  getTownsExtendedResponse,
  getTownsQueryParamsSchema,
  getTownsResponse,
  upsertTownInput,
  upsertTownResponse,
} from "@ou-ca/common/api/town";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
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
    const town = await townService.findTown(req.params.id, req.user);
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

    const [townsData, count] = await Promise.all([
      townService.findPaginatedTowns(req.user, queryParams),
      townService.getTownsCount(req.user, queryParams),
    ]);

    let data: Town[] | TownExtended[] = townsData;
    if (extended) {
      data = await Promise.all(
        townsData.map(async (townData) => {
          // TODO look to optimize this request
          const department = (await departmentService.findDepartmentOfTownId(townData.id, req.user))._unsafeUnwrap();
          const localitiesCount = await townService.getLocalitiesCountByTown(townData.id, req.user);
          const entriesCount = await townService.getEntriesCountByTown(townData.id, req.user);
          return {
            ...townData,
            departmentCode: department?.code,
            localitiesCount,
            entriesCount,
          };
        })
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

    try {
      const town = await townService.createTown(input, req.user);
      const response = upsertTownResponse.parse(town);

      return await reply.send(response);
    } catch (e) {
      if (e instanceof OucaError && e.name === "OUCA0004") {
        return await reply.status(409).send();
      }
      throw e;
    }
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

    try {
      const town = await townService.updateTown(req.params.id, input, req.user);
      const response = upsertTownResponse.parse(town);

      return await reply.send(response);
    } catch (e) {
      if (e instanceof OucaError && e.name === "OUCA0004") {
        return await reply.status(409).send();
      }
      throw e;
    }
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    try {
      const { id: deletedId } = await townService.deleteTown(req.params.id, req.user);
      return await reply.send({ id: deletedId });
    } catch (e) {
      if (e instanceof NotFoundError) {
        return await reply.status(404).send();
      }
      throw e;
    }
  });

  done();
};

export default townsController;
