import { PrismaClient } from "@prisma/client";
import options from "../utils/options";

export default new PrismaClient({
  datasources: {
    db: {
      url: `mysql://${options.dbUser}:${options.dbPassword}@${options.dbHost}:${options.dbPort}/${options.dbName}`
    }
  },
  errorFormat: 'minimal',
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});