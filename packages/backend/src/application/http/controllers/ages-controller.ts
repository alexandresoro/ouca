import {
  ageInfoSchema,
  getAgeResponse,
  getAgesQueryParamsSchema,
  getAgesResponse,
  upsertAgeInput,
  upsertAgeResponse,
} from "@ou-ca/common/api/age";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const agesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { ageService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const ageResult = await ageService.findAge(req.params.id, req.user);

    if (ageResult.isErr()) {
      switch (ageResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const age = ageResult.value;

    if (!age) {
      return await reply.status(404).send();
    }

    const response = getAgeResponse.parse(age);
    return await reply.send(response);
  });

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id/info", async (req, reply) => {
    const ageInfoResult = Result.combine([
      await ageService.getEntriesCountByAge(`${req.params.id}`, req.user),
      await ageService.isAgeUsed(`${req.params.id}`, req.user),
    ]);

    if (ageInfoResult.isErr()) {
      switch (ageInfoResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const [ownEntriesCount, isAgeUsed] = ageInfoResult.value;

    const response = ageInfoSchema.parse({
      canBeDeleted: !isAgeUsed,
      ownEntriesCount,
    });

    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getAgesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const { data: queryParams } = parsedQueryParamsResult;

    const paginatedResults = Result.combine([
      await ageService.findPaginatedAges(req.user, queryParams),
      await ageService.getAgesCount(req.user, queryParams.q),
    ]);

    if (paginatedResults.isErr()) {
      switch (paginatedResults.error) {
        case "notAllowed":
          return await reply.status(403).send();
      }
    }

    const [data, count] = paginatedResults.value;

    const response = getAgesResponse.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertAgeInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const ageCreateResult = await ageService.createAge(input, req.user);

    if (ageCreateResult.isErr()) {
      switch (ageCreateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
      }
    }

    const response = upsertAgeResponse.parse(ageCreateResult.value);
    return await reply.send(response);
  });

  fastify.put<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertAgeInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const ageUpdateResult = await ageService.updateAge(req.params.id, input, req.user);

    if (ageUpdateResult.isErr()) {
      switch (ageUpdateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
      }
    }

    const response = upsertAgeResponse.parse(ageUpdateResult.value);
    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedAgeResult = await ageService.deleteAge(req.params.id, req.user);

    if (deletedAgeResult.isErr()) {
      switch (deletedAgeResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "isUsed":
          return await reply.status(409).send();
      }
    }

    const deletedAge = deletedAgeResult.value;

    if (!deletedAge) {
      return await reply.status(404).send();
    }

    return await reply.send({ id: deletedAge.id });
  });

  done();
};
