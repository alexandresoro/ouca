import * as Sentry from "@sentry/node";
import { getConfig } from "./config.js";
import { buildServer } from "./fastify.js";
import { buildServices } from "./services/services.js";
import shutdown from "./shutdown.js";
import { runDatabaseMigrations } from "./umzug.js";
import { logger } from "./utils/logger.js";
import { checkAndCreateFolders } from "./utils/paths.js";

const config = getConfig();

// Sentry
if (config.sentry.dsn) {
  logger.debug("Sentry instrumenting enabled");
}
Sentry.init({
  dsn: config.sentry.dsn,
  environment: config.sentry.environment,
  tracesSampleRate: 1.0,
});

logger.debug("Starting app");

checkAndCreateFolders();

(async () => {
  const services = await buildServices(config);

  await runDatabaseMigrations({
    logger: logger.child({ module: "umzug" }),
    slonik: services.slonik,
    dbConfig: config.database,
  });

  const server = await buildServer(services);

  process.on("SIGINT", shutdown(server, services));
  process.on("SIGTERM", shutdown(server, services));

  await server.listen({ ...config.server });
})().catch((e) => {
  Sentry.captureException(e);
  logger.error(e);
});
