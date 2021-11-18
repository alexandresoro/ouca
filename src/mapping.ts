import { RouteOptions } from "fastify";
import { HttpParameters } from "./http/httpParameters";
import {
  saveDonneeRequest,
  saveInventaireRequest
} from "./requests/creation-requests";
import { executeDatabaseMigration } from "./services/database-migration/database-migration.service";
import { clearAllTables } from "./services/entities/entity-service";

export const REQUEST_MAPPING: Record<string, {
  handler: (
    httpParameters?: HttpParameters<any>
  ) => Promise<unknown>,
}> = {
  "/api/inventaire/save": { handler: saveInventaireRequest },
  "/api/donnee/save": { handler: saveDonneeRequest },
  "/api/database/clear": { handler: clearAllTables },
  "/api/database/update": { handler: executeDatabaseMigration }
} as const;

export const routes = [] as RouteOptions[];