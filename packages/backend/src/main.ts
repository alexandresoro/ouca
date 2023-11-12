import { dbConfig } from "@infrastructure/config/database-config.js";
import { sentryConfig } from "@infrastructure/config/sentry-config.js";
import { serverConfig } from "@infrastructure/config/server-config.js";
import { getUmzugInstance } from "@infrastructure/umzug/umzug-instance.js";
import * as Sentry from "@sentry/node";
import { buildServer } from "./fastify.js";
import { startWorkersAndJobs } from "./jobs/job-runner.js";
import { buildServices } from "./services/services.js";
import shutdown from "./shutdown.js";
import { logger } from "./utils/logger.js";
import { checkAndCreateFolders } from "./utils/paths.js";

logger.debug("Starting app");

// Sentry
if (sentryConfig.dsn) {
  logger.debug("Sentry instrumenting enabled");
}
Sentry.init({
  dsn: sentryConfig.dsn,
  environment: sentryConfig.environment,
  release: sentryConfig.release,
  tracesSampleRate: 1.0,
});

checkAndCreateFolders();

const startApp = async () => {
  const services = await buildServices();

  if (dbConfig.migrator.runMigrations) {
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

  await server.listen({ ...serverConfig });
};

await startApp().catch((e) => {
  Sentry.captureException(e);
  logger.error(e);
});
