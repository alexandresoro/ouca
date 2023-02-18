import config from "./config.js";
import { buildServer, registerFastifyRoutes } from "./fastify.js";
import { buildServices } from "./services/services.js";
import shutdown from "./shutdown.js";
import { runDatabaseMigrations } from "./umzug.js";
import { logger } from "./utils/logger.js";
import { checkAndCreateFolders } from "./utils/paths.js";

logger.debug("Starting app");

checkAndCreateFolders();

(async () => {
  const services = await buildServices();

  await runDatabaseMigrations({ logger: logger.child({ module: "umzug" }), slonik: services.slonik });

  const server = await buildServer(services);

  process.on("SIGINT", shutdown(server, services));
  process.on("SIGTERM", shutdown(server, services));

  registerFastifyRoutes(server, services);

  await server.listen({ ...config.server });
})().catch((e) => {
  logger.error(e);
});
