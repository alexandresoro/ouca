import { sentryConfig } from "@infrastructure/config/sentry-config.js";
import * as Sentry from "@sentry/node";
import { logger } from "../../utils/logger.js";

export const initSentry = () => {
  // Sentry
  if (sentryConfig.dsn) {
    logger.debug("Sentry instrumenting enabled");
  }
  Sentry.init({
    dsn: sentryConfig.dsn,
    environment: sentryConfig.environment,
    release: sentryConfig.release,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Postgres()],
  });
};

export const captureException = (e: unknown) => {
  Sentry.captureException(e);
};
