import { pino } from "pino";
import options from "./options";

const getPinoTransportToUse = () => {
  return options.logToFile
    ? {
        target: "pino/file",
        options: {
          destination: "./logs/logfile.log",
          mkdir: true,
        },
      }
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: true,
        },
      };
};

export const logger = pino({
  level: options.logLevel,
  base: undefined,
  transport: getPinoTransportToUse(),
});
