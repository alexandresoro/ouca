import * as Sentry from "@sentry/node";
import config from "./config.js";
import { buildServer } from "./fastify.js";
import { buildServices } from "./services/services.js";
import shutdown from "./shutdown.js";
import { runDatabaseMigrations } from "./umzug.js";
import { logger } from "./utils/logger.js";
import { checkAndCreateFolders } from "./utils/paths.js";
// Importing @sentry/tracing patches the global hub for tracing to work.
import "@sentry/tracing";

// Sentry
if (config.sentry.dsn) {
  logger.debug("Sentry instrumenting enabled");
  Sentry.init({
    dsn: config.sentry.dsn,
    tracesSampleRate: 1.0,
  });
}

logger.debug("Starting app");

checkAndCreateFolders();

(async () => {
  const services = await buildServices();

  await runDatabaseMigrations({ logger: logger.child({ module: "umzug" }), slonik: services.slonik });

  const server = await buildServer(services);

  process.on("SIGINT", shutdown(server, services));
  process.on("SIGTERM", shutdown(server, services));

  await server.listen({ ...config.server });
})().catch((e) => {
  Sentry.captureException(e);
  logger.error(e);
});
