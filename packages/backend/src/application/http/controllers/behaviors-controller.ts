import {
  behaviorInfoSchema,
  getBehaviorResponse,
  getBehaviorsQueryParamsSchema,
  getBehaviorsResponse,
  upsertBehaviorInput,
  upsertBehaviorResponse,
} from "@ou-ca/common/api/behavior";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const behaviorsController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { behaviorService } = services;

  fastify.get<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const behaviorResult = await behaviorService.findBehavior(req.params.id, req.user);

    if (behaviorResult.isErr()) {
      switch (behaviorResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const behavior = behaviorResult.value;

    if (!behavior) {
      return await reply.status(404).send();
    }

    const response = getBehaviorResponse.parse(behavior);
    return await reply.send(response);
  });

  fastify.get<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>("/:id/info", async (req, reply) => {
    const behaviorInfoResult = Result.combine([
      await behaviorService.getEntriesCountByBehavior(`${req.params.id}`, req.user),
      await behaviorService.isBehaviorUsed(`${req.params.id}`, req.user),
    ]);

    if (behaviorInfoResult.isErr()) {
      switch (behaviorInfoResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const [ownEntriesCount, isBehaviorUsed] = behaviorInfoResult.value;

    const response = behaviorInfoSchema.parse({
      canBeDeleted: !isBehaviorUsed,
      ownEntriesCount,
    });

    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getBehaviorsQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const { data: queryParams } = parsedQueryParamsResult;

    const paginatedResults = Result.combine([
      await behaviorService.findPaginatedBehaviors(req.user, queryParams),
      await behaviorService.getBehaviorsCount(req.user, queryParams.q),
    ]);

    if (paginatedResults.isErr()) {
      switch (paginatedResults.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const [data, count] = paginatedResults.value;

    const response = getBehaviorsResponse.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertBehaviorInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const behaviorResult = await behaviorService.createBehavior(input, req.user);

    if (behaviorResult.isErr()) {
      switch (behaviorResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
      }
    }

    const response = upsertBehaviorResponse.parse(behaviorResult.value);
    return await reply.send(response);
  });

  fastify.put<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertBehaviorInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const behaviorResult = await behaviorService.updateBehavior(req.params.id, input, req.user);

    if (behaviorResult.isErr()) {
      switch (behaviorResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
      }
    }

    const response = upsertBehaviorResponse.parse(behaviorResult.value);
    return await reply.send(response);
  });

  fastify.delete<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedBehaviorResult = await behaviorService.deleteBehavior(req.params.id, req.user);

    if (deletedBehaviorResult.isErr()) {
      switch (deletedBehaviorResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "isUsed":
          return await reply.status(409).send();
      }
    }

    const deletedBehavior = deletedBehaviorResult.value;

    if (!deletedBehavior) {
      return await reply.status(404).send();
    }

    return await reply.send({ id: deletedBehavior.id });
  });

  done();
};
