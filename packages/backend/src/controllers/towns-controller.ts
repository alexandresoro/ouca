import { getTownResponse, upsertTownInput, upsertTownResponse } from "@ou-ca/common/api/town";
import { type Town } from "@ou-ca/common/entities/town";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Commune } from "../repositories/commune/commune-repository-types.js";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";

const reshapeTownRepositoryToApi = (town: Commune): Town => {
  // TODO Remove this later
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { id, departementId, editable, ...restTown } = town;
  return {
    ...restTown,
    id: `${id}`,
    departmentId: `${departementId}`,
    // TODO Remove this later
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    editable,
  };
};

const townsController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { communeService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const town = await communeService.findCommune(req.params.id, req.user);
    if (!town) {
      return await reply.status(404).send();
    }

    const response = getTownResponse.parse(reshapeTownRepositoryToApi(town));
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
      const response = upsertTownResponse.parse(reshapeTownRepositoryToApi(town));

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
      const response = upsertTownResponse.parse(reshapeTownRepositoryToApi(town));

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
