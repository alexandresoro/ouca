import { getSpeciesResponse, upsertSpeciesInput, upsertSpeciesResponse } from "@ou-ca/common/api/species";
import { type Species } from "@ou-ca/common/entities/species";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Espece } from "../repositories/espece/espece-repository-types.js";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";

const reshapeSpeciesRepositoryToApi = (species: Espece): Species => {
  const { id, classeId, ...restSpecies } = species;
  return {
    ...restSpecies,
    id: `${id}`,
    classId: classeId ? `${classeId}` : "", // Should not happen, but classe is nullable from DB?
  };
};

const speciesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { especeService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const species = await especeService.findEspece(req.params.id, req.user);
    if (!species) {
      return await reply.status(404).send();
    }

    const response = getSpeciesResponse.parse(reshapeSpeciesRepositoryToApi(species));
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
      const response = upsertSpeciesResponse.parse(reshapeSpeciesRepositoryToApi(species));

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
      const response = upsertSpeciesResponse.parse(reshapeSpeciesRepositoryToApi(species));

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
