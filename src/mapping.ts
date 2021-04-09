import { HttpMethod } from "./http/httpMethod";
import { HttpParameters } from "./http/httpParameters";
import {
  configurationUpdateRequest,
  getAppConfigurationRequest
} from "./requests/configuration-requests";
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
  getEspecesRequest,
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
import { clearAllTables } from "./sql-api/sql-api-common";

const EXCEL_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const REQUEST_MAPPING: Record<string, (
  httpParameters?: HttpParameters
) => Promise<unknown>> = {
  "/api/inventaire/save": saveInventaireRequest,
  "/api/inventaire/find": getInventaireByIdRequest,
  "/api/inventaire/find_id": getInventaireIdByIdRequest,
  "/api/donnee/search": getDonneesByCustomizedFiltersRequest,
  "/api/donnee/export": exportDonneesByCustomizedFiltersRequest,
  "/api/donnee/save": saveDonneeRequest,
  "/api/donnee/delete": deleteDonneeRequest,
  "/api/donnee/last": getLastDonneeIdRequest,
  "/api/donnee/next_regroupement": getNextRegroupementRequest,
  "/api/donnee/find_with_context": getDonneeByIdWithContextRequest,
  "/api/observateur/all": getObservateursRequest,
  "/api/observateur/save": saveObservateurRequest,
  "/api/observateur/delete": removeObservateurRequest,
  "/api/observateur/export": exportObservateursRequest,
  "/api/departement/all": getDepartementsRequest,
  "/api/departement/save": saveDepartementRequest,
  "/api/departement/delete": deleteDepartementRequest,
  "/api/departement/export": exportDepartementsRequest,
  "/api/commune/all": getCommunesRequest,
  "/api/commune/save": saveCommuneRequest,
  "/api/commune/delete": deleteCommuneRequest,
  "/api/commune/export": exportCommunesRequest,
  "/api/lieudit/all": getLieuxditsRequest,
  "/api/lieudit/save": saveLieuditRequest,
  "/api/lieudit/delete": deleteLieuditRequest,
  "/api/lieudit/export": exportLieuxditsRequest,
  "/api/meteo/all": getMeteosRequest,
  "/api/meteo/save": saveMeteoRequest,
  "/api/meteo/delete": deleteMeteoRequest,
  "/api/meteo/export": exportMeteosRequest,
  "/api/classe/all": getClassesRequest,
  "/api/classe/save": saveClasseRequest,
  "/api/classe/delete": deleteClasseRequest,
  "/api/classe/export": exportClassesRequest,
  "/api/espece/all": getEspecesRequest,
  "/api/espece/save": saveEspeceRequest,
  "/api/espece/delete": deleteEspeceRequest,
  "/api/espece/details_by_age": getEspeceDetailsByAgeRequest,
  "/api/espece/details_by_sexe": getEspeceDetailsBySexeRequest,
  "/api/espece/export": exportEspecesRequest,
  "/api/sexe/all": getSexesRequest,
  "/api/sexe/save": saveSexeRequest,
  "/api/sexe/delete": deleteSexeRequest,
  "/api/sexe/export": exportSexesRequest,
  "/api/age/all": getAgesRequest,
  "/api/age/save": saveAgeRequest,
  "/api/age/delete": deleteAgeRequest,
  "/api/age/export": exportAgesRequest,
  "/api/estimation-nombre/all": getEstimationsNombreRequest,
  "/api/estimation-nombre/save": saveEstimationNombreRequest,
  "/api/estimation-nombre/delete": deleteEstimationNombreRequest,
  "/api/estimation-nombre/export": exportEstimationsNombreRequest,
  "/api/estimation-distance/all": getEstimationsDistanceRequest,
  "/api/estimation-distance/save": saveEstimationDistanceRequest,
  "/api/estimation-distance/delete": deleteEstimationDistanceRequest,
  "/api/estimation-distance/export": exportEstimationsDistanceRequest,
  "/api/comportement/all": getComportementsRequest,
  "/api/comportement/save": saveComportementRequest,
  "/api/comportement/delete": deleteComportementRequest,
  "/api/comportement/export": exportComportementsRequest,
  "/api/milieu/all": getMilieuxRequest,
  "/api/milieu/save": saveMilieuRequest,
  "/api/milieu/delete": deleteMilieuRequest,
  "/api/milieu/export": exportMilieuxRequest,
  "/api/configuration/all": getAppConfigurationRequest,
  "/api/configuration/update": configurationUpdateRequest,
  "/api/database/clear": clearAllTables,
  "/api/database/save": saveDatabaseRequest,
  "/api/database/update": executeDatabaseMigration
};

export const REQUEST_METHODS: Record<string, HttpMethod[]> = {
  "/api/configuration/all": ["GET"],
  "/api/configuration/update": ["POST"]
};

// Mapping between the api requested and the media type (MIME) of the response
export const REQUEST_MEDIA_TYPE_RESPONSE_MAPPING: Record<string, string> = {
  "/api/database/save": "application/sql",
  "/api/observateur/export": EXCEL_MIME_TYPE,
  "/api/departement/export": EXCEL_MIME_TYPE,
  "/api/commune/export": EXCEL_MIME_TYPE,
  "/api/lieudit/export": EXCEL_MIME_TYPE,
  "/api/meteo/export": EXCEL_MIME_TYPE,
  "/api/classe/export": EXCEL_MIME_TYPE,
  "/api/espece/export": EXCEL_MIME_TYPE,
  "/api/sexe/export": EXCEL_MIME_TYPE,
  "/api/age/export": EXCEL_MIME_TYPE,
  "/api/estimation-nombre/export": EXCEL_MIME_TYPE,
  "/api/estimation-distance/export": EXCEL_MIME_TYPE,
  "/api/comportement/export": EXCEL_MIME_TYPE,
  "/api/milieu/export": EXCEL_MIME_TYPE,
  "/api/donnee/export": EXCEL_MIME_TYPE,
};

// List of api requests that expect to return a response as file attachment
// The value is actually a function that will return the file name to be used
export const REQUESTS_WITH_ATTACHMENT_FILE_NAME_RESPONSES: Record<string, () => string> = {
  "/api/database/save": saveDatabaseFileNameRequest
};
