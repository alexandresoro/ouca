import { createLogger, format, transports } from "winston";
import options from "./options";

const loggerFormat = format.printf(({ level, message, timestamp }) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `${timestamp} ${level}: ${message}`;
});

const getConsoleTypeToUse = () => {
  return options.logToFile ? new transports.File({
    maxsize: 1000000,
    maxFiles: 100,
    tailable: true,
    filename: "./logs/logfile.log"
  }) : new transports.Console();
}

export const logger = createLogger({
  format: format.combine(format.timestamp(), loggerFormat),
  transports: [getConsoleTypeToUse()],
  level: options.logLevel
});