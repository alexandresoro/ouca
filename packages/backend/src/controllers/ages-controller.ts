import {
  getAgeResponse,
  getAgesExtendedResponse,
  getAgesQueryParamsSchema,
  getAgesResponse,
  upsertAgeInput,
  upsertAgeResponse,
} from "@ou-ca/common/api/age";
import { type Age, type AgeExtended } from "@ou-ca/common/entities/age";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";

const agesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { ageService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const age = await ageService.findAge(req.params.id, req.user);
    if (!age) {
      return await reply.status(404).send();
    }

    const response = getAgeResponse.parse(age);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getAgesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(400).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const [agesData, count] = await Promise.all([
      ageService.findPaginatedAges(req.user, queryParams),
      ageService.getAgesCount(req.user, queryParams.q),
    ]);

    let data: Age[] | AgeExtended[] = agesData;
    if (extended) {
      data = await Promise.all(
        agesData.map(async (ageData) => {
          const entriesCount = await ageService.getDonneesCountByAge(ageData.id, req.user);
          return {
            ...ageData,
            entriesCount,
          };
        })
      );
    }

    const responseParser = extended ? getAgesExtendedResponse : getAgesResponse;
    const response = responseParser.parse({
      data,
      meta: {
        count,
      },
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertAgeInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const age = await ageService.createAge(input, req.user);
      const response = upsertAgeResponse.parse(age);

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
    const parsedInputResult = upsertAgeInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const age = await ageService.updateAge(req.params.id, input, req.user);
      const response = upsertAgeResponse.parse(age);

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
      const { id: deletedId } = await ageService.deleteAge(req.params.id, req.user);
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

export default agesController;
