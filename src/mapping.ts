import { RouteOptions } from "fastify";
import { HttpMethod } from "./http/httpMethod";
import { HttpParameters } from "./http/httpParameters";
import {
  deleteDonneeRequest, saveDonneeRequest,
  saveInventaireRequest
} from "./requests/creation-requests";
import {
  exportAgesRequest,
  exportClassesRequest,
  exportCommunesRequest,
  exportComportementsRequest,
  exportDepartementsRequest,
  exportEspecesRequest,
  exportEstimationsDistanceRequest,
  exportEstimationsNombreRequest,
  exportLieuxditsRequest,
  exportMeteosRequest,
  exportMilieuxRequest,
  exportObservateursRequest,
  exportSexesRequest, getEspeceDetailsByAgeRequest,
  getEspeceDetailsBySexeRequest
} from "./requests/gestion-requests";
import { saveDatabaseFileNameRequest, saveDatabaseRequest } from "./requests/save-requests";
import {
  exportDonneesByCustomizedFiltersRequest
} from "./requests/view-requests";
import { executeDatabaseMigration } from "./services/database-migration/database-migration.service";
import { clearAllTables } from "./services/entities/entity-service";

const EXCEL_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const REQUEST_MAPPING: Record<string, {
  method?: HttpMethod,
  handler: (
    httpParameters?: HttpParameters
  ) => Promise<unknown>,
  responseType?: string,
  responseAttachmentHandler?: () => string
}> = {
  "/api/inventaire/save": { handler: saveInventaireRequest },
  "/api/donnee/export": {
    handler: exportDonneesByCustomizedFiltersRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/donnee/save": { handler: saveDonneeRequest },
  "/api/donnee/delete": { handler: deleteDonneeRequest },
  "/api/observateur/export": {
    handler: exportObservateursRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/departement/export": {
    handler: exportDepartementsRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/commune/export": {
    handler: exportCommunesRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/lieudit/export": {
    handler: exportLieuxditsRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/meteo/export": {
    handler: exportMeteosRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/classe/export": {
    handler: exportClassesRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/espece/details_by_age": { handler: getEspeceDetailsByAgeRequest },
  "/api/espece/details_by_sexe": { handler: getEspeceDetailsBySexeRequest },
  "/api/espece/export": {
    handler: exportEspecesRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/sexe/export": {
    handler: exportSexesRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/age/export": {
    handler: exportAgesRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/estimation-nombre/export": {
    handler: exportEstimationsNombreRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/estimation-distance/export": {
    handler: exportEstimationsDistanceRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/comportement/export": {
    handler: exportComportementsRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/milieu/export": {
    handler: exportMilieuxRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/database/clear": { handler: clearAllTables },
  "/api/database/save": {
    handler: saveDatabaseRequest,
    responseType: "application/sql",
    responseAttachmentHandler: saveDatabaseFileNameRequest
  },
  "/api/database/update": { handler: executeDatabaseMigration }
} as const;

export const routes = [] as RouteOptions[];