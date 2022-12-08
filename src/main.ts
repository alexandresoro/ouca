import { fastify } from "fastify";
import { registerFastifyPlugins, registerFastifyRoutes } from "./fastify";
import { buildServices } from "./services/services";
import { logger } from "./utils/logger";
import options from "./utils/options";
import { checkAndCreateFolders } from "./utils/paths";

logger.debug("Starting app");

const server = fastify({
  logger,
});

checkAndCreateFolders();

(async () => {
  const services = await buildServices();
  const { slonik } = services;

  logger.debug("Services initialized successfully");
  logger.debug("Connection to database successful");

  await registerFastifyPlugins(server, services, logger);

  registerFastifyRoutes(server, services);

  await server.listen({ ...options.server });

  // Handle shutdown request gracefully
  // This is used when inside a container
  // See https://emmer.dev/blog/you-don-t-need-an-init-system-for-node.js-in-docker/
  // Alternative is to use --init flag
  const shutdown = () => {
    logger.info("Shutdown requested");
    Promise.all([
      slonik.end().then(() => {
        logger.info("Database connector has been shut down");
      }),
      server.close().then(() => {
        logger.info("Web server has been shut down");
      }),
    ]).finally(() => {
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})().catch((e) => {
  logger.error(e);
});
