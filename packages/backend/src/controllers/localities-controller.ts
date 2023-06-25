import { getLocalityResponse, upsertLocalityInput, upsertLocalityResponse } from "@ou-ca/common/api/locality";
import { type Locality } from "@ou-ca/common/entities/locality";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Lieudit } from "../repositories/lieudit/lieudit-repository-types.js";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";

export const reshapeLocalityRepositoryToApi = (locality: Lieudit): Locality => {
  // TODO Remove this later
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { id, communeId, altitude, latitude, longitude, editable, ...restLocality } = locality;
  return {
    ...restLocality,
    id: `${id}`,
    townId: `${communeId}`,
    coordinates: {
      altitude,
      latitude,
      longitude,
    },
    // TODO Remove this later
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    editable,
  };
};

const localitiesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { lieuditService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const locality = await lieuditService.findLieuDit(req.params.id, req.user);
    if (!locality) {
      return await reply.status(404).send();
    }

    const response = getLocalityResponse.parse(reshapeLocalityRepositoryToApi(locality));
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
      const response = upsertLocalityResponse.parse(reshapeLocalityRepositoryToApi(locality));

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
      const response = upsertLocalityResponse.parse(reshapeLocalityRepositoryToApi(locality));

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
