import { pino, type TransportTargetOptions } from "pino";
import options from "./options";

const getPinoTransportsToUse = () => {
  const transports: TransportTargetOptions[] = [];

  if (!options.isProduction) {
    // In dev, prettify the logs
    transports.push({
      target: "pino-pretty",
      level: options.log.level,
      options: {
        colorize: true,
        translateTime: true,
      },
    });
  } else {
    // In prod, write to stdout
    transports.push({
      target: "pino/file",
      level: options.log.level,
      options: {},
    });
  }

  if (options.log.logToFile) {
    transports.push({
      target: "pino/file",
      level: options.log.level,
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
  level: options.log.level,
  base: undefined,
  transport: getPinoTransportsToUse(),
});
