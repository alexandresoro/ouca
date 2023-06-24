import {
  getClassResponse,
  getClassesExtendedResponse,
  getClassesQueryParamsSchema,
  getClassesResponse,
  upsertClassInput,
  upsertClassResponse,
} from "@ou-ca/common/api/species-class";
import { type SpeciesClass, type SpeciesClassExtended } from "@ou-ca/common/entities/species-class";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";

const classesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { classeService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const speciesClass = await classeService.findClasse(req.params.id, req.user);
    if (!speciesClass) {
      return await reply.status(404).send();
    }

    const response = getClassResponse.parse(speciesClass);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getClassesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(400).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const [classesData, count] = await Promise.all([
      classeService.findPaginatedClasses(req.user, queryParams),
      classeService.getClassesCount(req.user, queryParams.q),
    ]);

    let data: SpeciesClass[] | SpeciesClassExtended[] = classesData;
    if (extended) {
      data = await Promise.all(
        classesData.map(async (classData) => {
          const speciesCount = await classeService.getEspecesCountByClasse(classData.id, req.user);
          const entriesCount = await classeService.getDonneesCountByClasse(classData.id, req.user);
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
      meta: {
        count,
      },
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertClassInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const speciesClass = await classeService.createClasse(input, req.user);
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
    const parsedInputResult = upsertClassInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const speciesClass = await classeService.updateClasse(req.params.id, input, req.user);
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
      const { id: deletedId } = await classeService.deleteClasse(req.params.id, req.user);
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
