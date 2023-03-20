import path from "node:path";
import { pino, type TransportTargetOptions } from "pino";
import config from "../config.js";

const getPinoTransportsToUse = () => {
  const transports: TransportTargetOptions[] = [];

  if (!config.isProduction) {
    // In dev, prettify the logs
    transports.push({
      target: "pino-pretty",
      level: config.log.level,
      options: {
        colorize: true,
        translateTime: true,
      },
    });
  } else {
    // In prod, write to stdout
    transports.push({
      target: "pino/file",
      level: config.log.level,
      options: {},
    });
  }

  if (config.log.logPath) {
    transports.push({
      target: "pino/file",
      level: config.log.level,
      options: {
        destination: path.join(config.log.logPath, "logFile.log"),
        mkdir: true,
      },
    });
  }

  return transports?.length
    ? {
        targets: transports,
      }
    : undefined;
};

export const logger = pino({
  level: config.log.level,
  base: undefined,
  transport: getPinoTransportsToUse(),
});
