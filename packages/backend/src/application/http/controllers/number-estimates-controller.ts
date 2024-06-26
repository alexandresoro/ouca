import {
  getNumberEstimateResponse,
  getNumberEstimatesQueryParamsSchema,
  getNumberEstimatesResponse,
  numberEstimateInfoSchema,
  upsertNumberEstimateInput,
  upsertNumberEstimateResponse,
} from "@ou-ca/common/api/number-estimate";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const numberEstimatesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { numberEstimateService } = services;

  fastify.get<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const numberEstimateResult = await numberEstimateService.findNumberEstimate(req.params.id, req.user);

    if (numberEstimateResult.isErr()) {
      switch (numberEstimateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const numberEstimate = numberEstimateResult.value;

    if (!numberEstimate) {
      return await reply.status(404).send();
    }

    const response = getNumberEstimateResponse.parse(numberEstimate);
    return await reply.send(response);
  });

  fastify.get<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>("/:id/info", async (req, reply) => {
    const numberEstimateInfoResult = Result.combine([
      await numberEstimateService.getEntriesCountByNumberEstimate(`${req.params.id}`, req.user),
      await numberEstimateService.isNumberEstimateUsed(`${req.params.id}`, req.user),
    ]);

    if (numberEstimateInfoResult.isErr()) {
      switch (numberEstimateInfoResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const [ownEntriesCount, isNumberEstimateUsed] = numberEstimateInfoResult.value;

    const response = numberEstimateInfoSchema.parse({
      canBeDeleted: !isNumberEstimateUsed,
      ownEntriesCount,
    });

    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getNumberEstimatesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const { data: queryParams } = parsedQueryParamsResult;

    const paginatedResults = Result.combine([
      await numberEstimateService.findPaginatesNumberEstimates(req.user, queryParams),
      await numberEstimateService.getNumberEstimatesCount(req.user, queryParams.q),
    ]);

    if (paginatedResults.isErr()) {
      switch (paginatedResults.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const [data, count] = paginatedResults.value;

    const response = getNumberEstimatesResponse.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertNumberEstimateInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const numberEstimateCreateResult = await numberEstimateService.createNumberEstimate(input, req.user);

    if (numberEstimateCreateResult.isErr()) {
      switch (numberEstimateCreateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
      }
    }

    const response = upsertNumberEstimateResponse.parse(numberEstimateCreateResult.value);
    return await reply.send(response);
  });

  fastify.put<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertNumberEstimateInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const numberEstimateUpdateResult = await numberEstimateService.updateNumberEstimate(req.params.id, input, req.user);

    if (numberEstimateUpdateResult.isErr()) {
      switch (numberEstimateUpdateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
      }
    }

    const response = upsertNumberEstimateResponse.parse(numberEstimateUpdateResult.value);
    return await reply.send(response);
  });

  fastify.delete<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedNumberEstimateResult = await numberEstimateService.deleteNumberEstimate(req.params.id, req.user);

    if (deletedNumberEstimateResult.isErr()) {
      switch (deletedNumberEstimateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "isUsed":
          return await reply.status(409).send();
      }
    }

    const deletedNumberEstimate = deletedNumberEstimateResult.value;

    if (!deletedNumberEstimate) {
      return await reply.status(404).send();
    }

    return await reply.send({ id: deletedNumberEstimate.id });
  });

  done();
};
