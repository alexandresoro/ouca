import { getBehaviorResponse, upsertBehaviorInput, upsertBehaviorResponse } from "@ou-ca/common/api/behavior";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";

const behaviorController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { comportementService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const behavior = await comportementService.findComportement(req.params.id, req.user);
    if (!behavior) {
      return await reply.status(404).send();
    }

    const response = getBehaviorResponse.parse(behavior);
    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertBehaviorInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const behavior = await comportementService.createComportement(input, req.user);
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
    const parsedInputResult = upsertBehaviorInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const behavior = await comportementService.updateComportement(req.params.id, input, req.user);
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
      const { id: deletedId } = await comportementService.deleteComportement(req.params.id, req.user);
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

export default behaviorController;
