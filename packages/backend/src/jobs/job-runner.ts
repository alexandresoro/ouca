import { type Services } from "../services/services.js";
import { createWorkers } from "./queue-workers.js";
import { createQueues, type Queues } from "./queues.js";

export const startWorkersAndJobs = async (services: Services): Promise<Queues> => {
  const { logger } = services;

  // Create workers
  createWorkers({ ...services, logger: logger.child({ module: "workers" }) });

  // Create queues
  const { geoJsonQueue } = createQueues({
    ...services,
    logger: logger.child({ module: "queues" }),
  });

  // Start jobs
  await geoJsonQueue.add("geojsonrefresh", undefined, {
    removeOnComplete: true,
    repeat: {
      every: 300000,
    },
  });

  return {
    geoJsonQueue,
  };
};

export const stopJobsAndQueues = async (queuesObj: Queues): Promise<void> => {
  const queues = Object.values(queuesObj);
  await Promise.all(
    queues.map(async (queue) => {
      // TODO: cleanup this
      await queue.removeRepeatable("geojsonrefresh", {
        every: 300000,
      });
    })
  );

  await Promise.all(
    queues.map(async (queue) => {
      await queue.obliterate();
    })
  );
};
