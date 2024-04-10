import {
  environmentInfoSchema,
  getEnvironmentResponse,
  getEnvironmentsQueryParamsSchema,
  getEnvironmentsResponse,
  upsertEnvironmentInput,
  upsertEnvironmentResponse,
} from "@ou-ca/common/api/environment";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const environmentsController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { environmentService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const environmentResult = await environmentService.findEnvironment(req.params.id, req.user);

    if (environmentResult.isErr()) {
      switch (environmentResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const environment = environmentResult.value;

    if (!environment) {
      return await reply.status(404).send();
    }

    const response = getEnvironmentResponse.parse(environment);
    return await reply.send(response);
  });

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id/info", async (req, reply) => {
    const environmentInfoResult = Result.combine([
      await environmentService.getEntriesCountByEnvironment(`${req.params.id}`, req.user),
      await environmentService.isEnvironmentUsed(`${req.params.id}`, req.user),
    ]);

    if (environmentInfoResult.isErr()) {
      switch (environmentInfoResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const [ownEntriesCount, isEnvironmentUsed] = environmentInfoResult.value;

    const response = environmentInfoSchema.parse({
      canBeDeleted: !isEnvironmentUsed,
      ownEntriesCount,
    });

    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getEnvironmentsQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const { data: queryParams } = parsedQueryParamsResult;

    const paginatedResults = Result.combine([
      await environmentService.findPaginatedEnvironments(req.user, queryParams),
      await environmentService.getEnvironmentsCount(req.user, queryParams.q),
    ]);

    if (paginatedResults.isErr()) {
      switch (paginatedResults.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const [data, count] = paginatedResults.value;

    const response = getEnvironmentsResponse.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertEnvironmentInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const environmentResult = await environmentService.createEnvironment(input, req.user);

    if (environmentResult.isErr()) {
      switch (environmentResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
      }
    }

    const response = upsertEnvironmentResponse.parse(environmentResult.value);
    return await reply.send(response);
  });

  fastify.put<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertEnvironmentInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const environmentResult = await environmentService.updateEnvironment(req.params.id, input, req.user);

    if (environmentResult.isErr()) {
      switch (environmentResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
      }
    }

    const response = upsertEnvironmentResponse.parse(environmentResult.value);
    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedEnvironmentResult = await environmentService.deleteEnvironment(req.params.id, req.user);

    if (deletedEnvironmentResult.isErr()) {
      switch (deletedEnvironmentResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "isUsed":
          return await reply.status(409).send();
      }
    }

    const deletedEnvironment = deletedEnvironmentResult.value;

    if (!deletedEnvironment) {
      return await reply.status(404).send();
    }

    return await reply.send({ id: deletedEnvironment.id });
  });

  done();
};
