import {
  getAgeResponse,
  getAgesExtendedResponse,
  getAgesQueryParamsSchema,
  getAgesResponse,
  upsertAgeInput,
  upsertAgeResponse,
} from "@ou-ca/common/api/age";
import type { Age, AgeSimple } from "@ou-ca/common/api/entities/age";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import { logger } from "../../../utils/logger.js";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

const agesController: FastifyPluginCallback<{
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
        default:
          logger.error({ error: ageResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const age = ageResult.value;

    if (!age) {
      return await reply.status(404).send();
    }

    const response = getAgeResponse.parse(age);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getAgesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const paginatedResults = Result.combine([
      await ageService.findPaginatedAges(req.user, queryParams),
      await ageService.getAgesCount(req.user, queryParams.q),
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

    const [agesData, count] = paginatedResults.value;

    let data: AgeSimple[] | Age[] = agesData;
    if (extended) {
      data = await Promise.all(
        agesData.map(async (ageData) => {
          const entriesCount = (await ageService.getEntriesCountByAge(ageData.id, req.user))._unsafeUnwrap();
          return {
            ...ageData,
            entriesCount,
          };
        }),
      );
    }

    const responseParser = extended ? getAgesExtendedResponse : getAgesResponse;
    const response = responseParser.parse({
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
        default:
          logger.error({ error: ageCreateResult.error }, "Unexpected error");
          return await reply.status(500).send();
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
        default:
          logger.error({ error: ageUpdateResult.error }, "Unexpected error");
          return await reply.status(500).send();
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
        default:
          logger.error({ error: deletedAgeResult.error }, "Unexpected error");
          return await reply.status(500).send();
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

export default agesController;
