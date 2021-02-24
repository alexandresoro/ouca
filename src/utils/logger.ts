import { createLogger, format, transports } from "winston";

const loggerFormat = format.printf(({ level, message, timestamp }) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `${timestamp} ${level}: ${message}`;
});

export const logger = createLogger({
  format: format.combine(format.timestamp(), loggerFormat),
  transports: [new transports.Console()],
  level: "debug"
});