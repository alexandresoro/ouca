import { type Services } from "../services/services.js";
import { buildWorkerGeoJSONRefresh } from "./geojson-queue.js";

export const createWorkers = (services: Services) => {
  const { logger } = services;
  logger.info("Starting workers");

  buildWorkerGeoJSONRefresh(services);

  logger.info("Workers have started");
};
