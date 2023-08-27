import {
  getObserverResponse,
  getObserversExtendedResponse,
  getObserversQueryParamsSchema,
  getObserversResponse,
  upsertObserverInput,
  upsertObserverResponse,
} from "@ou-ca/common/api/observer";
import { type Observer, type ObserverExtended } from "@ou-ca/common/entities/observer";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";
import { getPaginationMetadata } from "./controller-utils.js";

const observersController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { observateurService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const observer = await observateurService.findObservateur(req.params.id, req.user);
    if (!observer) {
      return await reply.status(404).send();
    }

    const response = getObserverResponse.parse(observer);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getObserversQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(400).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const [observersData, count] = await Promise.all([
      observateurService.findPaginatedObservateurs(req.user, queryParams),
      observateurService.getObservateursCount(req.user, queryParams.q),
    ]);

    let data: Observer[] | ObserverExtended[] = observersData;
    if (extended) {
      data = await Promise.all(
        observersData.map(async (observerData) => {
          const inventoriesCount = await observateurService.getInventoriesCountByObserver(observerData.id, req.user);
          const entriesCount = await observateurService.getDonneesCountByObservateur(observerData.id, req.user);
          return {
            ...observerData,
            inventoriesCount,
            entriesCount,
          };
        })
      );
    }

    const responseParser = extended ? getObserversExtendedResponse : getObserversResponse;
    const response = responseParser.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertObserverInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const observer = await observateurService.createObservateur(input, req.user);
      const response = upsertObserverResponse.parse(observer);

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
    const parsedInputResult = upsertObserverInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const observer = await observateurService.updateObservateur(req.params.id, input, req.user);
      const response = upsertObserverResponse.parse(observer);

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
      const { id: deletedId } = await observateurService.deleteObservateur(req.params.id, req.user);
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

export default observersController;
