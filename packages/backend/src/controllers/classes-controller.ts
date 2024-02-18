import { OucaError } from "@domain/errors/ouca-error.js";
import { type SpeciesClass, type SpeciesClassExtended } from "@ou-ca/common/api/entities/species-class";
import {
  getClassResponse,
  getClassesExtendedResponse,
  getClassesQueryParamsSchema,
  getClassesResponse,
  upsertClassInput,
  upsertClassResponse,
} from "@ou-ca/common/api/species-class";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
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
    const speciesClass = await classService.findClasse(req.params.id, req.user);
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

    const [classesData, count] = await Promise.all([
      classService.findPaginatedClasses(req.user, queryParams),
      classService.getClassesCount(req.user, queryParams.q),
    ]);

    let data: SpeciesClass[] | SpeciesClassExtended[] = classesData;
    if (extended) {
      data = await Promise.all(
        classesData.map(async (classData) => {
          const speciesCount = await classService.getEspecesCountByClasse(classData.id, req.user);
          const entriesCount = await classService.getDonneesCountByClasse(classData.id, req.user);
          return {
            ...classData,
            speciesCount,
            entriesCount,
          };
        })
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

    try {
      const speciesClass = await classService.createClasse(input, req.user);
      const response = upsertClassResponse.parse(speciesClass);

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
    const parsedInputResult = upsertClassInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const speciesClass = await classService.updateClasse(req.params.id, input, req.user);
      const response = upsertClassResponse.parse(speciesClass);

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
      const { id: deletedId } = await classService.deleteClasse(req.params.id, req.user);
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

export default classesController;
