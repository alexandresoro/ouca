import {
  getLocalitiesExtendedResponse,
  getLocalitiesQueryParamsSchema,
  getLocalitiesResponse,
  getLocalityResponse,
  upsertLocalityInput,
  upsertLocalityResponse,
} from "@ou-ca/common/api/locality";
import { type Locality, type LocalityExtended } from "@ou-ca/common/entities/locality";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";

const localitiesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { lieuditService, communeService, departementService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const locality = await lieuditService.findLieuDit(req.params.id, req.user);
    if (!locality) {
      return await reply.status(404).send();
    }

    const response = getLocalityResponse.parse(locality);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getLocalitiesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(400).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const [localitiesData, count] = await Promise.all([
      lieuditService.findPaginatedLieuxDits(req.user, queryParams),
      lieuditService.getLieuxDitsCount(req.user, queryParams),
    ]);

    let data: Locality[] | LocalityExtended[] = localitiesData;
    if (extended) {
      data = await Promise.all(
        localitiesData.map(async (localityData) => {
          // TODO look to optimize this request
          const town = await communeService.findCommuneOfLieuDitId(localityData.id, req.user);
          const department = town ? await departementService.findDepartementOfCommuneId(town.id, req.user) : null;
          const entriesCount = await lieuditService.getDonneesCountByLieuDit(localityData.id, req.user);
          return {
            ...localityData,
            townCode: town?.code,
            townName: town?.nom,
            departmentCode: department?.code,
            entriesCount,
          };
        })
      );
    }

    const responseParser = extended ? getLocalitiesExtendedResponse : getLocalitiesResponse;
    const response = responseParser.parse({
      data,
      meta: {
        count,
      },
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertLocalityInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const locality = await lieuditService.createLieuDit(input, req.user);
      const response = upsertLocalityResponse.parse(locality);

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
    const parsedInputResult = upsertLocalityInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const locality = await lieuditService.updateLieuDit(req.params.id, input, req.user);
      const response = upsertLocalityResponse.parse(locality);

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
      const { id: deletedId } = await lieuditService.deleteLieuDit(req.params.id, req.user);
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

export default localitiesController;
