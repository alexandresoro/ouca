import { RouteOptions } from "fastify";
import { HttpMethod } from "./http/httpMethod";
import { HttpParameters } from "./http/httpParameters";
import {
  deleteDonneeRequest, saveDonneeRequest,
  saveInventaireRequest
} from "./requests/creation-requests";
import {
  deleteAgeRequest,
  deleteClasseRequest,
  deleteCommuneRequest,
  deleteComportementRequest,
  deleteDepartementRequest,
  deleteEspeceRequest,
  deleteEstimationDistanceRequest,
  deleteEstimationNombreRequest,
  deleteLieuditRequest,
  deleteMeteoRequest,
  deleteMilieuRequest,
  deleteSexeRequest,
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
  getEspeceDetailsBySexeRequest, removeObservateurRequest
} from "./requests/gestion-requests";
import { saveDatabaseFileNameRequest, saveDatabaseRequest } from "./requests/save-requests";
import {
  exportDonneesByCustomizedFiltersRequest,
  getDonneesByCustomizedFiltersRequest
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
  "/api/donnee/search": { handler: getDonneesByCustomizedFiltersRequest },
  "/api/donnee/export": {
    handler: exportDonneesByCustomizedFiltersRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/donnee/save": { handler: saveDonneeRequest },
  "/api/donnee/delete": { handler: deleteDonneeRequest },
  "/api/observateur/delete": { handler: removeObservateurRequest },
  "/api/observateur/export": {
    handler: exportObservateursRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/departement/delete": { handler: deleteDepartementRequest },
  "/api/departement/export": {
    handler: exportDepartementsRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/commune/delete": { handler: deleteCommuneRequest },
  "/api/commune/export": {
    handler: exportCommunesRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/lieudit/delete": { handler: deleteLieuditRequest },
  "/api/lieudit/export": {
    handler: exportLieuxditsRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/meteo/delete": { handler: deleteMeteoRequest },
  "/api/meteo/export": {
    handler: exportMeteosRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/classe/delete": { handler: deleteClasseRequest },
  "/api/classe/export": {
    handler: exportClassesRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/espece/delete": { handler: deleteEspeceRequest },
  "/api/espece/details_by_age": { handler: getEspeceDetailsByAgeRequest },
  "/api/espece/details_by_sexe": { handler: getEspeceDetailsBySexeRequest },
  "/api/espece/export": {
    handler: exportEspecesRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/sexe/delete": { handler: deleteSexeRequest },
  "/api/sexe/export": {
    handler: exportSexesRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/age/delete": { handler: deleteAgeRequest },
  "/api/age/export": {
    handler: exportAgesRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/estimation-nombre/delete": { handler: deleteEstimationNombreRequest },
  "/api/estimation-nombre/export": {
    handler: exportEstimationsNombreRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/estimation-distance/delete": { handler: deleteEstimationDistanceRequest },
  "/api/estimation-distance/export": {
    handler: exportEstimationsDistanceRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/comportement/delete": { handler: deleteComportementRequest },
  "/api/comportement/export": {
    handler: exportComportementsRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/milieu/delete": { handler: deleteMilieuRequest },
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