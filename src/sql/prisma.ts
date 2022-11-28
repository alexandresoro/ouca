import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import options from "../utils/options";

/**
 * @deprecated
 */
const prismaClient = new PrismaClient({
  datasources: {
    db: {
      url: options.database.prismaUrl,
    },
  },
  errorFormat: "minimal",
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

// Prisma queries logger
prismaClient.$on("query", (e) => {
  logger.trace(e);
});
prismaClient.$on("error", (e) => {
  logger.error(e);
});
prismaClient.$on("warn", (e) => {
  logger.warn(e);
});
prismaClient.$on("info", (e) => {
  logger.info(e);
});

export default prismaClient;
