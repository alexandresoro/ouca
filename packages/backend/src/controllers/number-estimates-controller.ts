import {
  getNumberEstimateResponse,
  getNumberEstimatesExtendedResponse,
  getNumberEstimatesQueryParamsSchema,
  getNumberEstimatesResponse,
  upsertNumberEstimateInput,
  upsertNumberEstimateResponse,
} from "@ou-ca/common/api/number-estimate";
import { type NumberEstimate, type NumberEstimateExtended } from "@ou-ca/common/entities/number-estimate";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";
import { getPaginationMetadata } from "./controller-utils.js";

const numberEstimatesController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { estimationNombreService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const numberEstimate = await estimationNombreService.findEstimationNombre(req.params.id, req.user);
    if (!numberEstimate) {
      return await reply.status(404).send();
    }

    const response = getNumberEstimateResponse.parse(numberEstimate);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getNumberEstimatesQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(400).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const [numberEstimatesData, count] = await Promise.all([
      estimationNombreService.findPaginatedEstimationsNombre(req.user, queryParams),
      estimationNombreService.getEstimationsNombreCount(req.user, queryParams.q),
    ]);

    let data: NumberEstimate[] | NumberEstimateExtended[] = numberEstimatesData;
    if (extended) {
      data = await Promise.all(
        numberEstimatesData.map(async (numberEstimateData) => {
          const entriesCount = await estimationNombreService.getDonneesCountByEstimationNombre(
            numberEstimateData.id,
            req.user
          );
          return {
            ...numberEstimateData,
            entriesCount,
          };
        })
      );
    }

    const responseParser = extended ? getNumberEstimatesExtendedResponse : getNumberEstimatesResponse;
    const response = responseParser.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertNumberEstimateInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const numberEstimate = await estimationNombreService.createEstimationNombre(input, req.user);
      const response = upsertNumberEstimateResponse.parse(numberEstimate);

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
    const parsedInputResult = upsertNumberEstimateInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const numberEstimate = await estimationNombreService.updateEstimationNombre(req.params.id, input, req.user);
      const response = upsertNumberEstimateResponse.parse(numberEstimate);

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
      const { id: deletedId } = await estimationNombreService.deleteEstimationNombre(req.params.id, req.user);
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

export default numberEstimatesController;
