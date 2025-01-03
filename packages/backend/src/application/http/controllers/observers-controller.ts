import {
  deleteObserverResponse,
  getObserverResponse,
  getObserversQueryParamsSchema,
  getObserversResponse,
  observerInfoSchema,
  upsertObserverInput,
  upsertObserverResponse,
} from "@ou-ca/common/api/observer";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const observersController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { observerService } = services;

  fastify.get<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Observer"],
      },
    },
    async (req, reply) => {
      const observerResult = await observerService.findObserver(req.params.id, req.user);

      if (observerResult.isErr()) {
        switch (observerResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const observer = observerResult.value;

      if (!observer) {
        return await reply.status(404).send();
      }

      const response = getObserverResponse.parse(observer);
      return await reply.send(response);
    },
  );

  fastify.get<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Observer"],
      },
    },
    async (req, reply) => {
      const observerInfoResult = Result.combine([
        await observerService.getEntriesCountByObserver(`${req.params.id}`, req.user),
        await observerService.isObserverUsed(`${req.params.id}`, req.user),
      ]);

      if (observerInfoResult.isErr()) {
        switch (observerInfoResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const [ownEntriesCount, isObserverUsed] = observerInfoResult.value;

      const response = observerInfoSchema.parse({
        canBeDeleted: !isObserverUsed,
        ownEntriesCount,
      });

      return await reply.send(response);
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Observer"],
        querystring: getObserversQueryParamsSchema,
      },
    },
    async (req, reply) => {
      const parsedQueryParamsResult = getObserversQueryParamsSchema.safeParse(req.query);

      if (!parsedQueryParamsResult.success) {
        return await reply.status(422).send(parsedQueryParamsResult.error.issues);
      }

      const { data: queryParams } = parsedQueryParamsResult;

      const paginatedResults = Result.combine([
        await observerService.findPaginatedObservers(req.user, queryParams),
        await observerService.getObserversCount(req.user, queryParams.q),
      ]);

      if (paginatedResults.isErr()) {
        switch (paginatedResults.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const [data, count] = paginatedResults.value;

      const response = getObserversResponse.parse({
        data,
        meta: getPaginationMetadata(count, queryParams),
      });

      return await reply.send(response);
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Observer"],
        body: upsertObserverInput,
      },
    },
    async (req, reply) => {
      const parsedInputResult = upsertObserverInput.safeParse(req.body);

      if (!parsedInputResult.success) {
        return await reply.status(422).send();
      }

      const { data: input } = parsedInputResult;

      const observerCreateResult = await observerService.createObserver(input, req.user);

      if (observerCreateResult.isErr()) {
        switch (observerCreateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertObserverResponse.parse(observerCreateResult.value);
      return await reply.send(response);
    },
  );

  fastify.put<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Observer"],
        body: upsertObserverInput,
      },
    },
    async (req, reply) => {
      const parsedInputResult = upsertObserverInput.safeParse(req.body);

      if (!parsedInputResult.success) {
        return await reply.status(422).send();
      }

      const { data: input } = parsedInputResult;

      const observerUpdateResult = await observerService.updateObserver(req.params.id, input, req.user);

      if (observerUpdateResult.isErr()) {
        switch (observerUpdateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertObserverResponse.parse(observerUpdateResult.value);
      return await reply.send(response);
    },
  );

  fastify.delete<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Observer"],
      },
    },
    async (req, reply) => {
      const deletedObserverResult = await observerService.deleteObserver(req.params.id, req.user);

      if (deletedObserverResult.isErr()) {
        switch (deletedObserverResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "isUsed":
            return await reply.status(409).send();
        }
      }

      const deletedObserver = deletedObserverResult.value;

      if (!deletedObserver) {
        return await reply.status(404).send();
      }

      const response = deleteObserverResponse.parse(deletedObserver);
      return await reply.send(response);
    },
  );

  done();
};
