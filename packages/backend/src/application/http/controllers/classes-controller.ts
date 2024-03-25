import type { SpeciesClass, SpeciesClassExtended } from "@ou-ca/common/api/entities/species-class";
import {
  getClassResponse,
  getClassesExtendedResponse,
  getClassesQueryParamsSchema,
  getClassesResponse,
  upsertClassInput,
  upsertClassResponse,
} from "@ou-ca/common/api/species-class";
import type { FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import { logger } from "../../../utils/logger.js";
import type { Services } from "../../services/services.js";
import { getPaginationMetadata } from "./controller-utils.js";

const classesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { classService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const speciesClassResult = await classService.findSpeciesClass(req.params.id, req.user);

    if (speciesClassResult.isErr()) {
      switch (speciesClassResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: speciesClassResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const speciesClass = speciesClassResult.value;

    if (!speciesClass) {
      return await reply.status(404).send();
    }

    const response = getClassResponse.parse(speciesClass);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getClassesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const paginatedResults = Result.combine([
      await classService.findPaginatedSpeciesClasses(req.user, queryParams),
      await classService.getSpeciesClassesCount(req.user, queryParams.q),
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

    const [classesData, count] = paginatedResults.value;

    let data: SpeciesClass[] | SpeciesClassExtended[] = classesData;
    if (extended) {
      data = await Promise.all(
        classesData.map(async (classData) => {
          const speciesCount = (
            await classService.getSpeciesCountBySpeciesClass(classData.id, req.user)
          )._unsafeUnwrap();
          const entriesCount = (
            await classService.getEntriesCountBySpeciesClass(classData.id, req.user)
          )._unsafeUnwrap();
          return {
            ...classData,
            speciesCount,
            entriesCount,
          };
        }),
      );
    }

    const responseParser = extended ? getClassesExtendedResponse : getClassesResponse;
    const response = responseParser.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertClassInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const speciesClassCreateResult = await classService.createSpeciesClass(input, req.user);

    if (speciesClassCreateResult.isErr()) {
      switch (speciesClassCreateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
        default:
          logger.error({ error: speciesClassCreateResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertClassResponse.parse(speciesClassCreateResult.value);
    return await reply.send(response);
  });

  fastify.put<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertClassInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const speciesClassUpdateResult = await classService.updateSpeciesClass(req.params.id, input, req.user);

    if (speciesClassUpdateResult.isErr()) {
      switch (speciesClassUpdateResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
        default:
          logger.error({ error: speciesClassUpdateResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertClassResponse.parse(speciesClassUpdateResult.value);
    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedSpeciesClassResult = await classService.deleteSpeciesClass(req.params.id, req.user);

    if (deletedSpeciesClassResult.isErr()) {
      switch (deletedSpeciesClassResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: deletedSpeciesClassResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const deletedSpeciesClass = deletedSpeciesClassResult.value;

    if (!deletedSpeciesClass) {
      return await reply.status(404).send();
    }

    return await reply.send({ id: deletedSpeciesClass.id });
  });

  done();
};

export default classesController;
