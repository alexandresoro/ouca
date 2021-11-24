import { RouteOptions } from "fastify";
import { executeDatabaseMigration } from "./services/database-migration/database-migration.service";
import { clearAllTables } from "./services/entities/entity-service";

export const REQUEST_MAPPING: Record<string, {
  handler: () => Promise<unknown>,
}> = {
  "/api/database/clear": { handler: clearAllTables },
  "/api/database/update": { handler: executeDatabaseMigration }
} as const;

export const routes = [] as RouteOptions[];