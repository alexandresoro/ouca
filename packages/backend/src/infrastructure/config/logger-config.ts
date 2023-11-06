import { type LoggerConfig } from "@domain/config/logger-config.js";
import { pino } from "pino";
import { z } from "zod";

const initLogger = pino({
  level: "warn",
  base: undefined,
});

const envLogSchema = z.object({
  OUCA_LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("warn"),
});

const getLoggerConfig = (): LoggerConfig => {
  const envLoggerParseResult = envLogSchema.safeParse(process.env);
  if (!envLoggerParseResult.success) {
    initLogger.fatal(
      { error: envLoggerParseResult.error },
      "An error has occurred when trying to parse the environment"
    );
    process.exit(1);
  }
  const env = envLoggerParseResult.data;

  return {
    level: env.OUCA_LOG_LEVEL,
  };
};

export const loggerConfig = getLoggerConfig();
