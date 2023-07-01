import { Queue, Worker } from "bullmq";
import { type Services } from "../services/services.js";

const GEOJSON_QUEUE_NAME = "geojson";

export const buildQueueGeoJSONRefresh = (services: Services): Queue => {
  const { logger, redis: connection } = services;

  logger.debug({ worker: GEOJSON_QUEUE_NAME }, "Queue geojson is being created");
  return new Queue(GEOJSON_QUEUE_NAME, { connection });
};

export const buildWorkerGeoJSONRefresh = (services: Services): void => {
  const { logger, redis: connection, geojsonService } = services;
  logger.debug({ worker: GEOJSON_QUEUE_NAME }, "Worker geojson is being created");

  new Worker(
    GEOJSON_QUEUE_NAME,
    async () => {
      logger.debug({ worker: GEOJSON_QUEUE_NAME }, "GeoJSON refresh has started");
      await geojsonService.updateGeoJSONData();
    },
    {
      connection,
      limiter: {
        max: 5,
        duration: 30000,
      },
    }
  );

  logger.debug({ worker: GEOJSON_QUEUE_NAME }, "Worker geojson has been created");
};
