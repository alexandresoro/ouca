import { workerLogger } from "@infrastructure/bullmq/worker.js";
import type { Services } from "../services/services.js";
import { startGeoJSONWorker } from "./geojson/geojson-worker.js";

export const startWorkers = (services: Services) => {
  const { geojsonService } = services;

  workerLogger.info("Starting workers");

  // GeoJSON worker
  startGeoJSONWorker({ geojsonService });

  workerLogger.info("Workers started");
};
