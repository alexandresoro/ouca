import { z } from "zod";
import { logger } from "../../utils/logger.js";

const envSentrySchema = z.object({
  // biome-ignore lint/style/useNamingConvention: <explanation>
  SENTRY_DSN: z.string().optional(),
  // biome-ignore lint/style/useNamingConvention: <explanation>
  SENTRY_ENV: z.string().optional(),
  // biome-ignore lint/style/useNamingConvention: <explanation>
  SENTRY_RELEASE: z.string().trim().min(1).optional(),
});

export const getSentryConfig = () => {
  const envSentryParseResult = envSentrySchema.safeParse(process.env);
  if (!envSentryParseResult.success) {
    logger.fatal({ error: envSentryParseResult.error }, "An error has occurred when trying to parse the environment");
    process.exit(1);
  }
  const env = envSentryParseResult.data;
  return {
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENV,
    release: env.SENTRY_RELEASE,
  };
};

export const sentryConfig = getSentryConfig();
