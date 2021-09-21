import { RouteOptions } from "fastify";
import { HttpMethod } from "./http/httpMethod";
import { HttpParameters } from "./http/httpParameters";
import {
  deleteDonneeRequest,
  getDonneeByIdWithContextRequest,
  getInventaireByIdRequest,
  getInventaireIdByIdRequest,
  getLastDonneeIdRequest,
  getNextRegroupementRequest,
  saveDonneeRequest,
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
  exportSexesRequest,
  getAgesRequest,
  getClassesRequest,
  getCommunesRequest,
  getComportementsRequest,
  getDepartementsRequest,
  getEspeceDetailsByAgeRequest,
  getEspeceDetailsBySexeRequest,
  getEstimationsDistanceRequest,
  getEstimationsNombreRequest,
  getLieuxditsRequest,
  getMeteosRequest,
  getMilieuxRequest, getObservateursRequest,
  getSexesRequest,
  removeObservateurRequest,
  saveAgeRequest,
  saveClasseRequest,
  saveCommuneRequest,
  saveComportementRequest,
  saveDepartementRequest,
  saveEspeceRequest,
  saveEstimationDistanceRequest,
  saveEstimationNombreRequest,
  saveLieuditRequest,
  saveMeteoRequest,
  saveMilieuRequest,
  saveObservateurRequest,
  saveSexeRequest
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
  "/api/inventaire/find": { handler: getInventaireByIdRequest },
  "/api/inventaire/find_id": { handler: getInventaireIdByIdRequest },
  "/api/donnee/search": { handler: getDonneesByCustomizedFiltersRequest },
  "/api/donnee/export": {
    handler: exportDonneesByCustomizedFiltersRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/donnee/save": { handler: saveDonneeRequest },
  "/api/donnee/delete": { handler: deleteDonneeRequest },
  "/api/donnee/last": { handler: getLastDonneeIdRequest },
  "/api/donnee/next_regroupement": { handler: getNextRegroupementRequest },
  "/api/donnee/find_with_context": { handler: getDonneeByIdWithContextRequest },
  "/api/observateur/all": { handler: getObservateursRequest },
  "/api/observateur/save": { handler: saveObservateurRequest },
  "/api/observateur/delete": { handler: removeObservateurRequest },
  "/api/observateur/export": {
    handler: exportObservateursRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/departement/all": { handler: getDepartementsRequest },
  "/api/departement/save": { handler: saveDepartementRequest },
  "/api/departement/delete": { handler: deleteDepartementRequest },
  "/api/departement/export": {
    handler: exportDepartementsRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/commune/all": { handler: getCommunesRequest },
  "/api/commune/save": { handler: saveCommuneRequest },
  "/api/commune/delete": { handler: deleteCommuneRequest },
  "/api/commune/export": {
    handler: exportCommunesRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/lieudit/all": { handler: getLieuxditsRequest },
  "/api/lieudit/save": { handler: saveLieuditRequest },
  "/api/lieudit/delete": { handler: deleteLieuditRequest },
  "/api/lieudit/export": {
    handler: exportLieuxditsRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/meteo/all": { handler: getMeteosRequest },
  "/api/meteo/save": { handler: saveMeteoRequest },
  "/api/meteo/delete": { handler: deleteMeteoRequest },
  "/api/meteo/export": {
    handler: exportMeteosRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/classe/all": { handler: getClassesRequest },
  "/api/classe/save": { handler: saveClasseRequest },
  "/api/classe/delete": { handler: deleteClasseRequest },
  "/api/classe/export": {
    handler: exportClassesRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/espece/save": { handler: saveEspeceRequest },
  "/api/espece/delete": { handler: deleteEspeceRequest },
  "/api/espece/details_by_age": { handler: getEspeceDetailsByAgeRequest },
  "/api/espece/details_by_sexe": { handler: getEspeceDetailsBySexeRequest },
  "/api/espece/export": {
    handler: exportEspecesRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/sexe/all": { handler: getSexesRequest },
  "/api/sexe/save": { handler: saveSexeRequest },
  "/api/sexe/delete": { handler: deleteSexeRequest },
  "/api/sexe/export": {
    handler: exportSexesRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/age/all": { handler: getAgesRequest },
  "/api/age/save": { handler: saveAgeRequest },
  "/api/age/delete": { handler: deleteAgeRequest },
  "/api/age/export": {
    handler: exportAgesRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/estimation-nombre/all": { handler: getEstimationsNombreRequest },
  "/api/estimation-nombre/save": { handler: saveEstimationNombreRequest },
  "/api/estimation-nombre/delete": { handler: deleteEstimationNombreRequest },
  "/api/estimation-nombre/export": {
    handler: exportEstimationsNombreRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/estimation-distance/all": { handler: getEstimationsDistanceRequest },
  "/api/estimation-distance/save": { handler: saveEstimationDistanceRequest },
  "/api/estimation-distance/delete": { handler: deleteEstimationDistanceRequest },
  "/api/estimation-distance/export": {
    handler: exportEstimationsDistanceRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/comportement/all": { handler: getComportementsRequest },
  "/api/comportement/save": { handler: saveComportementRequest },
  "/api/comportement/delete": { handler: deleteComportementRequest },
  "/api/comportement/export": {
    handler: exportComportementsRequest,
    responseType: EXCEL_MIME_TYPE
  },
  "/api/milieu/all": { handler: getMilieuxRequest },
  "/api/milieu/save": { handler: saveMilieuRequest },
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