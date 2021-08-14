import { PrismaClient } from "@prisma/client";
import options from "../utils/options";

export default new PrismaClient({
  datasources: {
    db: {
      url: `mysql://${options.dbUser}:${options.dbPassword}@${options.dbHost}:${options.dbPort}/${options.dbName}`
    }
  },
  log: ['query', 'info', 'warn', 'error']
});