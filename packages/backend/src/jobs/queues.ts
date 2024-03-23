import type { Queue } from "bullmq";
import type { Logger } from "pino";
import type { Services } from "../application/services/services.js";
import { buildQueueGeoJSONRefresh } from "./geojson-queue.js";

export type Queues = {
  geoJsonQueue: Queue;
};

export const createQueues = (services: Services, logger: Logger): Queues => {
  logger.info("Creating queues");

  const geoJsonQueue = buildQueueGeoJSONRefresh(services, logger);

  logger.info("Queues have been created");

  return {
    geoJsonQueue,
  };
};
