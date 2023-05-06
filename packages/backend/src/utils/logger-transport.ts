import { type TransportTargetOptions } from "pino";
import { type Config } from "../config.js";

export const getPinoTransportsToUse = (level: Config["log"]["level"], isProduction: boolean) => {
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
