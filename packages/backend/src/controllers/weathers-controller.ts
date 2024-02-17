import { type Weather, type WeatherExtended } from "@ou-ca/common/api/entities/weather";
import {
  getWeatherResponse,
  getWeathersExtendedResponse,
  getWeathersQueryParamsSchema,
  getWeathersResponse,
  upsertWeatherInput,
  upsertWeatherResponse,
} from "@ou-ca/common/api/weather";
import { type FastifyPluginCallback } from "fastify";
import { Result } from "neverthrow";
import { type Services } from "../services/services.js";
import { logger } from "../utils/logger.js";
import { getPaginationMetadata } from "./controller-utils.js";

const weathersController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { weatherService: meteoService } = services;

  fastify.get<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const weatherResult = await meteoService.findWeather(req.params.id, req.user);

    if (weatherResult.isErr()) {
      switch (weatherResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: weatherResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const weather = weatherResult.value;

    if (!weather) {
      return await reply.status(404).send();
    }

    const response = getWeatherResponse.parse(weather);
    return await reply.send(response);
  });

  fastify.get("/", async (req, reply) => {
    const parsedQueryParamsResult = getWeathersQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParamsResult.success) {
      return await reply.status(422).send(parsedQueryParamsResult.error.issues);
    }

    const {
      data: { extended, ...queryParams },
    } = parsedQueryParamsResult;

    const paginatedResults = Result.combine([
      await meteoService.findPaginatedWeathers(req.user, queryParams),
      await meteoService.getWeathersCount(req.user, queryParams.q),
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

    const [weathersData, count] = paginatedResults.value;

    let data: Weather[] | WeatherExtended[] = weathersData;
    if (extended) {
      data = await Promise.all(
        weathersData.map(async (weatherData) => {
          const entriesCount = await meteoService.getEntriesCountByWeather(weatherData.id, req.user);
          return {
            ...weatherData,
            entriesCount,
          };
        })
      );
    }

    const responseParser = extended ? getWeathersExtendedResponse : getWeathersResponse;
    const response = responseParser.parse({
      data,
      meta: getPaginationMetadata(count, queryParams),
    });

    return await reply.send(response);
  });

  fastify.post("/", async (req, reply) => {
    const parsedInputResult = upsertWeatherInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const weatherResult = await meteoService.createWeather(input, req.user);

    if (weatherResult.isErr()) {
      switch (weatherResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
        default:
          logger.error({ error: weatherResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertWeatherResponse.parse(weatherResult.value);
    return await reply.send(response);
  });

  fastify.put<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const parsedInputResult = upsertWeatherInput.safeParse(req.body);

    if (!parsedInputResult.success) {
      return await reply.status(422).send();
    }

    const { data: input } = parsedInputResult;

    const weatherResult = await meteoService.updateWeather(req.params.id, input, req.user);

    if (weatherResult.isErr()) {
      switch (weatherResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        case "alreadyExists":
          return await reply.status(409).send();
        default:
          logger.error({ error: weatherResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const response = upsertWeatherResponse.parse(weatherResult.value);
    return await reply.send(response);
  });

  fastify.delete<{
    Params: {
      id: number;
    };
  }>("/:id", async (req, reply) => {
    const deletedWeatherResult = await meteoService.deleteWeather(req.params.id, req.user);

    if (deletedWeatherResult.isErr()) {
      switch (deletedWeatherResult.error) {
        case "notAllowed":
          return await reply.status(403).send();
        default:
          logger.error({ error: deletedWeatherResult.error }, "Unexpected error");
          return await reply.status(500).send();
      }
    }

    const deletedWeather = deletedWeatherResult.value;

    if (!deletedWeather) {
      return await reply.status(404).send();
    }

    return await reply.send({ id: deletedWeather.id });
  });

  done();
};

export default weathersController;
