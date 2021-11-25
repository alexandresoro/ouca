import { RouteOptions } from "fastify";
import { clearAllTables } from "./services/entities/entity-service";

export const REQUEST_MAPPING: Record<string, {
  handler: () => Promise<unknown>,
}> = {
  "/api/database/clear": { handler: clearAllTables }
} as const;

export const routes = [] as RouteOptions[];