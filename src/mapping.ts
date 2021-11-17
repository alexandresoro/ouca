import { RouteOptions } from "fastify";
import { HttpMethod } from "./http/httpMethod";
import { HttpParameters } from "./http/httpParameters";
import {
  deleteDonneeRequest, saveDonneeRequest,
  saveInventaireRequest
} from "./requests/creation-requests";
import {
  getEspeceDetailsByAgeRequest,
  getEspeceDetailsBySexeRequest
} from "./requests/gestion-requests";
import { saveDatabaseFileNameRequest, saveDatabaseRequest } from "./requests/save-requests";
import { executeDatabaseMigration } from "./services/database-migration/database-migration.service";
import { clearAllTables } from "./services/entities/entity-service";

export const REQUEST_MAPPING: Record<string, {
  method?: HttpMethod,
  handler: (
    httpParameters?: HttpParameters<any>
  ) => Promise<unknown>,
  responseType?: string,
  responseAttachmentHandler?: () => string
}> = {
  "/api/inventaire/save": { handler: saveInventaireRequest },
  "/api/donnee/save": { handler: saveDonneeRequest },
  "/api/donnee/delete": { handler: deleteDonneeRequest },
  "/api/espece/details_by_age": { handler: getEspeceDetailsByAgeRequest },
  "/api/espece/details_by_sexe": { handler: getEspeceDetailsBySexeRequest },
  "/api/database/clear": { handler: clearAllTables },
  "/api/database/save": {
    handler: saveDatabaseRequest,
    responseType: "application/sql",
    responseAttachmentHandler: saveDatabaseFileNameRequest
  },
  "/api/database/update": { handler: executeDatabaseMigration }
} as const;

export const routes = [] as RouteOptions[];