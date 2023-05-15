import { getDistanceEstimateResponse, upsertDistanceEstimateInput, upsertDistanceEstimateResponse } from "@ou-ca/common/api/distance-estimate";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";

const distanceEstimateController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { estimationDistanceService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const distanceEstimate = await estimationDistanceService.findEstimationDistance(req.params.id, req.user);
    if (!distanceEstimate) {
      return await reply.status(404).send();
    }

    const response = getDistanceEstimateResponse.parse(distanceEstimate);
    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertDistanceEstimateInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const distanceEstimate = await estimationDistanceService.createEstimationDistance(input, req.user);
      const response = upsertDistanceEstimateResponse.parse(distanceEstimate);

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
    const parsedInputResult = upsertDistanceEstimateInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const distanceEstimate = await estimationDistanceService.updateEstimationDistance(req.params.id, input, req.user);
      const response = upsertDistanceEstimateResponse.parse(distanceEstimate);

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
      const { id: deletedId } = await estimationDistanceService.deleteEstimationDistance(req.params.id, req.user);
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

export default distanceEstimateController;
