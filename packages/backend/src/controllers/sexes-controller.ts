import type { Sex, SexExtended } from "@ou-ca/common/api/entities/sex";
import {
  getSexResponse,
  getSexesExtendedResponse,
  getSexesQueryParamsSchema,
  getSexesResponse,
  upsertSexInput,
  upsertSexResponse,
} from "@ou-ca/common/api/sex";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import type { Services } from "../services/services.js";
import { logger } from "../utils/logger.js";
import { getPaginationMetadata } from "./controller-utils.js";

const sexesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { sexService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const sexResult = await sexService.findSex(req.params.id, req.user);

    if (sexResult.isErr()) {
      switch (sexResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: sexResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const sex = sexResult.value;

    if (!sex) {
      return await reply.status(404).send();
    }

    const response = getSexResponse.parse(sex);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getSexesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const paginatedResults = Result.combine([
      await sexService.findPaginatedSexes(req.user, queryParams),
      await sexService.getSexesCount(req.user, queryParams.q),
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

    const [sexesData, count] = paginatedResults.value;

    let data: Sex[] | SexExtended[] = sexesData;
    if (extended) {
      data = await Promise.all(
        sexesData.map(async (sexData) => {
          const entriesCount = (await sexService.getEntriesCountBySex(sexData.id, req.user))._unsafeUnwrap();
          return {
            ...sexData,
            entriesCount,
          };
        }),
      );
    }

    const responseParser = extended ? getSexesExtendedResponse : getSexesResponse;
    const response = responseParser.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertSexInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const sexCreateResult = await sexService.createSex(input, req.user);

    if (sexCreateResult.isErr()) {
      switch (sexCreateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
        default:
          logger.error({ error: sexCreateResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertSexResponse.parse(sexCreateResult.value);
    return await reply.send(response);
  });

  fastify.put<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertSexInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const sexUpdateResult = await sexService.updateSex(req.params.id, input, req.user);

    if (sexUpdateResult.isErr()) {
      switch (sexUpdateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
        default:
          logger.error({ error: sexUpdateResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertSexResponse.parse(sexUpdateResult.value);
    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedSexResult = await sexService.deleteSex(req.params.id, req.user);

    if (deletedSexResult.isErr()) {
      switch (deletedSexResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: deletedSexResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const deletedSex = deletedSexResult.value;

    if (!deletedSex) {
      return await reply.status(404).send();
    }

    return await reply.send({ id: deletedSex.id });
  });

  done();
};

export default sexesController;
