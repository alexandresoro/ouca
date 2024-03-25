import {
  getBehaviorResponse,
  getBehaviorsExtendedResponse,
  getBehaviorsQueryParamsSchema,
  getBehaviorsResponse,
  upsertBehaviorInput,
  upsertBehaviorResponse,
} from "@ou-ca/common/api/behavior";
import type { Behavior, BehaviorExtended } from "@ou-ca/common/api/entities/behavior";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import { logger } from "../../../utils/logger.js";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const behaviorsController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { behaviorService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const behaviorResult = await behaviorService.findBehavior(req.params.id, req.user);

    if (behaviorResult.isErr()) {
      switch (behaviorResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: behaviorResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const behavior = behaviorResult.value;

    if (!behavior) {
      return await reply.status(404).send();
    }

    const response = getBehaviorResponse.parse(behavior);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getBehaviorsQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const paginatedResults = Result.combine([
      await behaviorService.findPaginatedBehaviors(req.user, queryParams),
      await behaviorService.getBehaviorsCount(req.user, queryParams.q),
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

    const [behaviorsData, count] = paginatedResults.value;

    let data: Behavior[] | BehaviorExtended[] = behaviorsData;
    if (extended) {
      data = await Promise.all(
        behaviorsData.map(async (behaviorData) => {
          const entriesCount = (
            await behaviorService.getEntriesCountByBehavior(behaviorData.id, req.user)
          )._unsafeUnwrap();
          return {
            ...behaviorData,
            entriesCount,
          };
        }),
      );
    }

    const responseParser = extended ? getBehaviorsExtendedResponse : getBehaviorsResponse;
    const response = responseParser.parse({
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
        default:
          logger.error({ error: behaviorResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertBehaviorResponse.parse(behaviorResult.value);
    return await reply.send(response);
  });

  fastify.put<{
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
        default:
          logger.error({ error: behaviorResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertBehaviorResponse.parse(behaviorResult.value);
    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedBehaviorResult = await behaviorService.deleteBehavior(req.params.id, req.user);

    if (deletedBehaviorResult.isErr()) {
      switch (deletedBehaviorResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: deletedBehaviorResult.error }, "Unexpected error");
          return await reply.status(500).send();
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
