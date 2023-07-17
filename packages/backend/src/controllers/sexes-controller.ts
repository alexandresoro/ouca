import {
  getSexResponse,
  getSexesExtendedResponse,
  getSexesQueryParamsSchema,
  getSexesResponse,
  upsertSexInput,
  upsertSexResponse,
} from "@ou-ca/common/api/sex";
import { type Sex, type SexExtended } from "@ou-ca/common/entities/sex";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";
import { getPaginationMetadata } from "./controller-utils.js";

const sexesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { sexeService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const sex = await sexeService.findSexe(req.params.id, req.user);
    if (!sex) {
      return await reply.status(404).send();
    }

    const response = getSexResponse.parse(sex);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getSexesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(400).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const [sexesData, count] = await Promise.all([
      sexeService.findPaginatedSexes(req.user, queryParams),
      sexeService.getSexesCount(req.user, queryParams.q),
    ]);

    let data: Sex[] | SexExtended[] = sexesData;
    if (extended) {
      data = await Promise.all(
        sexesData.map(async (sexData) => {
          const entriesCount = await sexeService.getDonneesCountBySexe(sexData.id, req.user);
          return {
            ...sexData,
            entriesCount,
          };
        })
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
    const parsedInputResult = upsertSexInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const sex = await sexeService.createSexe(input, req.user);
      const response = upsertSexResponse.parse(sex);

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
    const parsedInputResult = upsertSexInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const sex = await sexeService.updateSexe(req.params.id, input, req.user);
      const response = upsertSexResponse.parse(sex);

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
      const { id: deletedId } = await sexeService.deleteSexe(req.params.id, req.user);
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

export default sexesController;
