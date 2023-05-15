import { getWeatherResponse, upsertWeatherInput, upsertWeatherResponse } from "@ou-ca/common/api/weather";
import { type FastifyPluginCallback } from "fastify";
import { NotFoundError } from "slonik";
import { type Services } from "../services/services.js";
import { OucaError } from "../utils/errors.js";

const weatherController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { meteoService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const weather = await meteoService.findMeteo(req.params.id, req.user);
    if (!weather) {
      return await reply.status(404).send();
    }

    const response = getWeatherResponse.parse(weather);
    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertWeatherInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const weather = await meteoService.createMeteo(input, req.user);
      const response = upsertWeatherResponse.parse(weather);

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
    const parsedInputResult = upsertWeatherInput.safeParse(JSON.parse(req.body as string));

    if (!parsedInputResult.success) {
      return await reply.status(400).send();
    }

    const { data: input } = parsedInputResult;

    try {
      const weather = await meteoService.updateMeteo(req.params.id, input, req.user);
      const response = upsertWeatherResponse.parse(weather);

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
      const { id: deletedId } = await meteoService.deleteMeteo(req.params.id, req.user);
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

export default weatherController;
