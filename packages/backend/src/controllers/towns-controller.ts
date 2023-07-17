import {
  getTownResponse,
  getTownsExtendedResponse,
  getTownsQueryParamsSchema,
  getTownsResponse,
  upsertTownInput,
  upsertTownResponse,
} from "@ou-ca/common/api/town";
import { type Town, type TownExtended } from "@ou-ca/common/entities/town";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";
import { getPaginationMetadata } from "./controller-utils.js";

const townsController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { communeService, departementService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const town = await communeService.findCommune(req.params.id, req.user);
    if (!town) {
      return await reply.status(404).send();
    }

    const response = getTownResponse.parse(town);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getTownsQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(400).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const [townsData, count] = await Promise.all([
      communeService.findPaginatedCommunes(req.user, queryParams),
      communeService.getCommunesCount(req.user, queryParams),
    ]);

    let data: Town[] | TownExtended[] = townsData;
    if (extended) {
      data = await Promise.all(
        townsData.map(async (townData) => {
          // TODO look to optimize this request
          const department = await departementService.findDepartementOfCommuneId(townData.id, req.user);
          const localitiesCount = await communeService.getLieuxDitsCountByCommune(townData.id, req.user);
          const entriesCount = await communeService.getDonneesCountByCommune(townData.id, req.user);
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
    const parsedInputResult = upsertTownInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const town = await communeService.createCommune(input, req.user);
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
    const parsedInputResult = upsertTownInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const town = await communeService.updateCommune(req.params.id, input, req.user);
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
      const { id: deletedId } = await communeService.deleteCommune(req.params.id, req.user);
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
