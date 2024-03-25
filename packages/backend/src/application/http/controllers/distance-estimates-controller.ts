import {
  getDistanceEstimateResponse,
  getDistanceEstimatesExtendedResponse,
  getDistanceEstimatesQueryParamsSchema,
  getDistanceEstimatesResponse,
  upsertDistanceEstimateInput,
  upsertDistanceEstimateResponse,
} from "@ou-ca/common/api/distance-estimate";
import type { DistanceEstimate, DistanceEstimateExtended } from "@ou-ca/common/api/entities/distance-estimate";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import { logger } from "../../../utils/logger.js";
import type { Services } from "../../services/services.js";
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
    const distanceEstimateResult = await distanceEstimateService.findDistanceEstimate(req.params.id, req.user);

    if (distanceEstimateResult.isErr()) {
      switch (distanceEstimateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: distanceEstimateResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const distanceEstimate = distanceEstimateResult.value;

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

    const paginatedResults = Result.combine([
      await distanceEstimateService.findPaginatedDistanceEstimates(req.user, queryParams),
      await distanceEstimateService.getDistanceEstimatesCount(req.user, queryParams.q),
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

    const [distanceEstimatesData, count] = paginatedResults.value;

    let data: DistanceEstimate[] | DistanceEstimateExtended[] = distanceEstimatesData;
    if (extended) {
      data = await Promise.all(
        distanceEstimatesData.map(async (distanceEstimateData) => {
          const entriesCount = (
            await distanceEstimateService.getEntriesCountByDistanceEstimate(distanceEstimateData.id, req.user)
          )._unsafeUnwrap();
          return {
            ...distanceEstimateData,
            entriesCount,
          };
        }),
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

    const distanceEstimateCreateResult = await distanceEstimateService.createDistanceEstimate(input, req.user);

    if (distanceEstimateCreateResult.isErr()) {
      switch (distanceEstimateCreateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
        default:
          logger.error({ error: distanceEstimateCreateResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertDistanceEstimateResponse.parse(distanceEstimateCreateResult.value);
    return await reply.send(response);
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

    const distanceEstimateUpdateResult = await distanceEstimateService.updateDistanceEstimate(
      req.params.id,
      input,
      req.user,
    );

    if (distanceEstimateUpdateResult.isErr()) {
      switch (distanceEstimateUpdateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
        default:
          logger.error({ error: distanceEstimateUpdateResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertDistanceEstimateResponse.parse(distanceEstimateUpdateResult.value);
    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedDistanceEstimateResult = await distanceEstimateService.deleteDistanceEstimate(req.params.id, req.user);

    if (deletedDistanceEstimateResult.isErr()) {
      switch (deletedDistanceEstimateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: deletedDistanceEstimateResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const deletedDistanceEstimate = deletedDistanceEstimateResult.value;

    if (!deletedDistanceEstimate) {
      return await reply.status(404).send();
    }

    return await reply.send({ id: deletedDistanceEstimate.id });
  });

  done();
};

export default distanceEstimatesController;
