import { OucaError } from "@domain/errors/ouca-error.js";
import {
  getDistanceEstimateResponse,
  getDistanceEstimatesExtendedResponse,
  getDistanceEstimatesQueryParamsSchema,
  getDistanceEstimatesResponse,
  upsertDistanceEstimateInput,
  upsertDistanceEstimateResponse,
} from "@ou-ca/common/api/distance-estimate";
import { type DistanceEstimate, type DistanceEstimateExtended } from "@ou-ca/common/api/entities/distance-estimate";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

const distanceEstimatesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { distanceEstimateService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const distanceEstimate = await distanceEstimateService.findDistanceEstimate(req.params.id, req.user);
    if (!distanceEstimate) {
      return await reply.status(404).send();
    }

    const response = getDistanceEstimateResponse.parse(distanceEstimate);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getDistanceEstimatesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const [distanceEstimatesData, count] = await Promise.all([
      distanceEstimateService.findPaginatedDistanceEstimates(req.user, queryParams),
      distanceEstimateService.getDistanceEstimatesCount(req.user, queryParams.q),
    ]);

    let data: DistanceEstimate[] | DistanceEstimateExtended[] = distanceEstimatesData;
    if (extended) {
      data = await Promise.all(
        distanceEstimatesData.map(async (distanceEstimateData) => {
          const entriesCount = await distanceEstimateService.getEntriesCountByDistanceEstimate(
            distanceEstimateData.id,
            req.user
          );
          return {
            ...distanceEstimateData,
            entriesCount,
          };
        })
      );
    }

    const responseParser = extended ? getDistanceEstimatesExtendedResponse : getDistanceEstimatesResponse;
    const response = responseParser.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertDistanceEstimateInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const distanceEstimate = await distanceEstimateService.createDistanceEstimate(input, req.user);
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
    const parsedInputResult = upsertDistanceEstimateInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const distanceEstimate = await distanceEstimateService.updateDistanceEstimate(req.params.id, input, req.user);
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
      const { id: deletedId } = await distanceEstimateService.deleteDistanceEstimate(req.params.id, req.user);
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

export default distanceEstimatesController;
