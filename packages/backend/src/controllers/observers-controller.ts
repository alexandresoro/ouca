import {
  deleteObserverResponse,
  getObserverResponse,
  getObserversQueryParamsSchema,
  getObserversResponse,
  upsertObserverInput,
  upsertObserverResponse,
} from "@ou-ca/common/api/observer";
import { type FastifyPluginCallback } from "fastify";
import { type Services } from "../services/services.js";
import { logger } from "../utils/logger.js";
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
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const [data, count] = await Promise.all([
      observateurService.findPaginatedObservateurs(req.user, queryParams),
      observateurService.getObservateursCount(req.user, queryParams.q),
    ]);

    const response = getObserversResponse.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertObserverInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const observerCreateResult = await observateurService.createObservateur(input, req.user);

    if (observerCreateResult.isOk()) {
      const response = upsertObserverResponse.parse(observerCreateResult.value);
      return await reply.send(response);
    }

    switch (observerCreateResult.error) {
      case "notAllowed":
        return await reply.status(403).send();
      case "alreadyExists":
        return await reply.status(409).send();
      default:
        logger.error({ error: observerCreateResult.error }, "Unexpected error");
        return await reply.status(500).send();
    }
  });

  fastify.put<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertObserverInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const observerUpdateResult = await observateurService.updateObservateur(req.params.id, input, req.user);

    if (observerUpdateResult.isOk()) {
      const response = upsertObserverResponse.parse(observerUpdateResult.value);
      return await reply.send(response);
    }

    switch (observerUpdateResult.error) {
      case "notAllowed":
        return await reply.status(403).send();
      case "alreadyExists":
        return await reply.status(409).send();
      default:
        logger.error({ error: observerUpdateResult.error }, "Unexpected error");
        return await reply.status(500).send();
    }
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedObserver = await observateurService.deleteObservateur(req.params.id, req.user);

    if (!deletedObserver) {
      return await reply.status(404).send();
    }

    const response = deleteObserverResponse.parse(deletedObserver);
    return await reply.send(response);
  });

  done();
};

export default observersController;
