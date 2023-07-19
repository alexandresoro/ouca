import * as Sentry from "@sentry/node";
import {
  type FastifyInstance,
  type RawReplyDefaultExpression,
  type RawRequestDefaultExpression,
  type RawServerDefault,
} from "fastify";
import { type Logger } from "pino";
import { stopJobsAndQueues } from "./jobs/job-runner.js";
import { type Queues } from "./jobs/queues.js";
import { type Services } from "./services/services.js";

// Handle shutdown request gracefully
// This is used when inside a container
// See https://emmer.dev/blog/you-don-t-need-an-init-system-for-node.js-in-docker/
const shutdown =
  (
    server: FastifyInstance<
      RawServerDefault,
      RawRequestDefaultExpression<RawServerDefault>,
      RawReplyDefaultExpression<RawServerDefault>,
      Logger
    >,
    services: Services,
    queues: Queues
  ): (() => void) =>
  () => {
    services.logger.info("Shutdown requested");
    Promise.all([
      stopJobsAndQueues(queues),
      Sentry.close(2000),
      services.slonik.end().then(() => {
        services.logger.info("Database connector has been shut down");
      }),
      server.close().then(() => {
        services.logger.info("Web server has been shut down");
      }),
    ]).finally(() => {
      process.exit(0);
    });
  };

export default shutdown;
