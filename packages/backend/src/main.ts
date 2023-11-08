import { config } from "@infrastructure/config/config.js";
import { getUmzugInstance } from "@infrastructure/umzug/umzug-instance.js";
import * as Sentry from "@sentry/node";
import { buildServer } from "./fastify.js";
import { startWorkersAndJobs } from "./jobs/job-runner.js";
import { buildServices } from "./services/services.js";
import shutdown from "./shutdown.js";
import { logger } from "./utils/logger.js";
import { checkAndCreateFolders } from "./utils/paths.js";

// Sentry
if (config.sentry.dsn) {
  logger.debug("Sentry instrumenting enabled");
}
Sentry.init({
  dsn: config.sentry.dsn,
  environment: config.sentry.environment,
  release: config.sentry.release,
  tracesSampleRate: 1.0,
});

logger.debug("Starting app");

checkAndCreateFolders();

(async () => {
  const services = await buildServices(config);

  if (config.database.migrator.runMigrations) {
    logger.child({ module: "umzug" }).debug("Running database migrations");
    const umzug = getUmzugInstance();
    await umzug.up();
  } else {
    logger.debug("No migrations to run as feature is disabled");
  }

  await startWorkersAndJobs(services);

  const server = await buildServer(services);

  process.on("SIGINT", shutdown(server, services));
  process.on("SIGTERM", shutdown(server, services));

  await server.listen({ ...config.server });
})().catch((e) => {
  Sentry.captureException(e);
  logger.error(e);
});
