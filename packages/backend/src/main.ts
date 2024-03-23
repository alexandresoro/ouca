import { serverConfig } from "@infrastructure/config/server-config.js";
import { captureException, initSentry } from "@infrastructure/sentry/sentry.js";
import { runMigrations } from "@infrastructure/umzug/umzug-instance.js";
import { buildServices } from "./application/services/services.js";
import { buildServer } from "./fastify.js";
import { startWorkersAndJobs } from "./jobs/job-runner.js";
import { shutdown } from "./shutdown.js";
import { logger } from "./utils/logger.js";
import { checkAndCreateFolders } from "./utils/paths.js";

logger.debug("Starting app");

// Sentry
initSentry();

checkAndCreateFolders();

// Run database migrations if active
await runMigrations().catch((e) => {
  captureException(e);
  logger.error(e);
});

const startApp = async () => {
  const services = buildServices();

  await startWorkersAndJobs(services);

  const server = await buildServer(services);

  process.on("SIGINT", shutdown(server));
  process.on("SIGTERM", shutdown(server));

  await server.listen({ ...serverConfig });
};

await startApp().catch((e) => {
  captureException(e);
  logger.error(e);
});
