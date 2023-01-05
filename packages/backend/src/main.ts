import config from "./config";
import { buildServer, registerFastifyRoutes } from "./fastify";
import { buildServices } from "./services/services";
import shutdown from "./shutdown";
import { runDatabaseMigrations } from "./umzug";
import { logger } from "./utils/logger";
import { checkAndCreateFolders } from "./utils/paths";

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
