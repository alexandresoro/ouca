import {
  deleteObserverResponse,
  getObserverResponse,
  getObserversQueryParamsSchema,
  getObserversResponse,
  upsertObserverInput,
  upsertObserverResponse,
} from "@ou-ca/common/api/observer";
import { type FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
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
    const observerResult = await observateurService.findObservateur(req.params.id, req.user);

    if (observerResult.isErr()) {
      switch (observerResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: observerResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const observer = observerResult.value;

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

    const paginatedResults = Result.combine([
      await observateurService.findPaginatedObservateurs(req.user, queryParams),
      await observateurService.getObservateursCount(req.user, queryParams.q),
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

    const [data, count] = paginatedResults.value;

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

    if (observerCreateResult.isErr()) {
      switch (observerCreateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
        default:
          logger.error({ error: observerCreateResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertObserverResponse.parse(observerCreateResult.value);
    return await reply.send(response);
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

    if (observerUpdateResult.isErr()) {
      switch (observerUpdateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
        default:
          logger.error({ error: observerUpdateResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertObserverResponse.parse(observerUpdateResult.value);
    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedObserverResult = await observateurService.deleteObservateur(req.params.id, req.user);

    if (deletedObserverResult.isErr()) {
      switch (deletedObserverResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: deletedObserverResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const deletedObserver = deletedObserverResult.value;

    if (!deletedObserver) {
      return await reply.status(404).send();
    }

    const response = deleteObserverResponse.parse(deletedObserver);
    return await reply.send(response);
  });

  done();
};

export default observersController;
