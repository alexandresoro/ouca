import {
  getEnvironmentResponse,
  upsertEnvironmentInput,
  upsertEnvironmentResponse,
} from "@ou-ca/common/api/environment";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";

const environmentsController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { milieuService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const environment = await milieuService.findMilieu(req.params.id, req.user);
    if (!environment) {
      return await reply.status(404).send();
    }

    const response = getEnvironmentResponse.parse(environment);
    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertEnvironmentInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const environment = await milieuService.createMilieu(input, req.user);
      const response = upsertEnvironmentResponse.parse(environment);

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
    const parsedInputResult = upsertEnvironmentInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const environment = await milieuService.updateMilieu(req.params.id, input, req.user);
      const response = upsertEnvironmentResponse.parse(environment);

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
      const { id: deletedId } = await milieuService.deleteMilieu(req.params.id, req.user);
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

export default environmentsController;
