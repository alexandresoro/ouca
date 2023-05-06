import { pino } from "pino";
import { getConfig, type Config } from "../config.js";
import { getPinoTransportsToUse } from "./logger-transport.js";

const getLogger = (config: Config) => {
  return pino({
    level: config.log.level,
    base: undefined,
    transport: getPinoTransportsToUse(config.log.level, !!config.isProduction),
  });
};

export const logger = getLogger(getConfig());
