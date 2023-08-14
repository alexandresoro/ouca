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
  // https://docs.bullmq.io/guide/jobs/repeatable
  // Pay attention to the trick where you can have two similar job ids with different options
  // Don't remove the job on shutdown as it won't support scaling otherwise
  // e.g. when a pod is stopped but others still remain or RollingUpdate strategy
  //
  // /!\ Pay attention whenever updating or removing jobs in the code, as they will still live
  // inside redis. They will need to be removed manually.
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
