import { type FastifyInstance } from "fastify";
import { type Services } from "./services/services";

// Handle shutdown request gracefully
// This is used when inside a container
// See https://emmer.dev/blog/you-don-t-need-an-init-system-for-node.js-in-docker/
const shutdown =
  (server: FastifyInstance, services: Services): (() => void) =>
  () => {
    services.logger.info("Shutdown requested");
    Promise.all([
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
