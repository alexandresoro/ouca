import { type Queue } from "bullmq";
import { type Services } from "../services/services.js";
import { buildQueueGeoJSONRefresh } from "./geojson-queue.js";

export type Queues = {
  geoJsonQueue: Queue;
};

export const createQueues = (services: Services): Queues => {
  const { logger } = services;
  logger.info("Creating queues");

  const geoJsonQueue = buildQueueGeoJSONRefresh(services);

  logger.info("Queues have been created");

  return {
    geoJsonQueue,
  };
};
