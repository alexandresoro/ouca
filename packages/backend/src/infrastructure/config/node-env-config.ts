import { type NodeEnvConfig } from "@domain/config/node-env-config.js";
import { pino } from "pino";
import { z } from "zod";

const initLogger = pino({
  level: "warn",
  base: undefined,
});

const nodeEnvSchema = z.object({
  NODE_ENV: z.string().optional(),
});

const getNodeEnvConfig = (): NodeEnvConfig => {
  const nodeEnvParseResult = nodeEnvSchema.safeParse(process.env);
  if (!nodeEnvParseResult.success) {
    initLogger.fatal({ error: nodeEnvParseResult.error }, "An error has occurred when trying to parse the environment");
    process.exit(1);
  }
  const env = nodeEnvParseResult.data;

  return {
    isProduction: env.NODE_ENV === "production",
  };
};

export const nodeEnvConfig = getNodeEnvConfig();