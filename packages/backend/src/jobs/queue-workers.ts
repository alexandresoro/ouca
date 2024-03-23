import type { Logger } from "pino";
import type { Services } from "../application/services/services.js";
import { buildWorkerGeoJSONRefresh } from "./geojson-queue.js";

export const createWorkers = (services: Services, logger: Logger) => {
  logger.info("Starting workers");

  buildWorkerGeoJSONRefresh(services, logger);

  logger.info("Workers have started");
};
