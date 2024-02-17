import { OucaError } from "@domain/errors/ouca-error.js";
import {
  getBehaviorResponse,
  getBehaviorsExtendedResponse,
  getBehaviorsQueryParamsSchema,
  getBehaviorsResponse,
  upsertBehaviorInput,
  upsertBehaviorResponse,
} from "@ou-ca/common/api/behavior";
import { type Behavior, type BehaviorExtended } from "@ou-ca/common/api/entities/behavior";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

const behaviorsController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { behaviorService: comportementService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const behavior = await comportementService.findBehavior(req.params.id, req.user);
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

    const [behaviorsData, count] = await Promise.all([
      comportementService.findPaginatedBehaviors(req.user, queryParams),
      comportementService.getBehaviorsCount(req.user, queryParams.q),
    ]);

    let data: Behavior[] | BehaviorExtended[] = behaviorsData;
    if (extended) {
      data = await Promise.all(
        behaviorsData.map(async (behaviorData) => {
          const entriesCount = await comportementService.getEntriesCountByBehavior(behaviorData.id, req.user);
          return {
            ...behaviorData,
            entriesCount,
          };
        })
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

    try {
      const behavior = await comportementService.createBehavior(input, req.user);
      const response = upsertBehaviorResponse.parse(behavior);

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
    const parsedInputResult = upsertBehaviorInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const behavior = await comportementService.updateBehavior(req.params.id, input, req.user);
      const response = upsertBehaviorResponse.parse(behavior);

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
      const { id: deletedId } = await comportementService.deleteBehavior(req.params.id, req.user);
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

export default behaviorsController;
