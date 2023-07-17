import {
  getSpeciesExtendedResponse,
  getSpeciesPaginatedResponse,
  getSpeciesQueryParamsSchema,
  getSpeciesResponse,
  upsertSpeciesInput,
  upsertSpeciesResponse,
} from "@ou-ca/common/api/species";
import { type Species, type SpeciesExtended } from "@ou-ca/common/entities/species";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";
import { getPaginationMetadata } from "./controller-utils.js";

const speciesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { especeService, classeService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const species = await especeService.findEspece(req.params.id, req.user);
    if (!species) {
      return await reply.status(404).send();
    }

    const response = getSpeciesResponse.parse(species);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getSpeciesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(400).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const [speciesData, count] = await Promise.all([
      especeService.findPaginatedEspeces(req.user, queryParams),
      especeService.getEspecesCount(req.user, queryParams),
    ]);

    let data: Species[] | SpeciesExtended[] = speciesData;
    if (extended) {
      data = await Promise.all(
        speciesData.map(async (singleSpeciesData) => {
          // TODO look to optimize this request
          const speciesClass = await classeService.findClasseOfEspeceId(singleSpeciesData.id, req.user);
          const entriesCount = await especeService.getDonneesCountByEspece(singleSpeciesData.id, req.user);
          return {
            ...singleSpeciesData,
            speciesClassName: speciesClass?.libelle,
            entriesCount,
          };
        })
      );
    }

    const responseParser = extended ? getSpeciesExtendedResponse : getSpeciesPaginatedResponse;
    const response = responseParser.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertSpeciesInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const species = await especeService.createEspece(input, req.user);
      const response = upsertSpeciesResponse.parse(species);

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
    const parsedInputResult = upsertSpeciesInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const species = await especeService.updateEspece(req.params.id, input, req.user);
      const response = upsertSpeciesResponse.parse(species);

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
      const { id: deletedId } = await especeService.deleteEspece(req.params.id, req.user);
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

export default speciesController;
