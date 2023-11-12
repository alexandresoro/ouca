import { loggerConfig } from "@infrastructure/config/logger-config.js";
import { nodeEnvConfig } from "@infrastructure/config/node-env-config.js";
import { pino, type TransportTargetOptions } from "pino";

const getPinoTransportsToUse = ({ level }: typeof loggerConfig, isProduction: boolean) => {
  const transports: TransportTargetOptions[] = [];

  if (!isProduction) {
    // In dev, prettify the logs
    transports.push({
      target: "pino-pretty",
      level,
      options: {
        colorize: true,
        translateTime: true,
      },
    });
  } else {
    // In prod, write to stdout
    transports.push({
      target: "pino/file",
      level,
      options: {},
    });
  }

  return transports?.length
    ? {
        targets: transports,
      }
    : undefined;
};

export const logger = pino({
  level: loggerConfig.level,
  base: undefined,
  transport: getPinoTransportsToUse(loggerConfig, nodeEnvConfig.isProduction),
});
