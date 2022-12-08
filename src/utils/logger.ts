import { pino, type TransportTargetOptions } from "pino";
import config from "../config";

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

  if (config.log.logToFile) {
    transports.push({
      target: "pino/file",
      level: config.log.level,
      options: {
        destination: "./logs/logfile.log",
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
