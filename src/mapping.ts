import { HttpMethod } from "./http/httpMethod";
import { HttpParameters } from "./http/httpParameters";
import {
  configurationUpdate,
  getAppConfiguration
} from "./requests/configuration";
import {
  deleteDonnee,
  getDonneeByIdWithContext,
  getInventaireById,
  getInventaireIdById,
  getLastDonneeId,
  getNextRegroupement,
  saveDonnee,
  saveInventaire
} from "./requests/creation";
import {
  deleteAge,
  deleteClasse,
  deleteCommune,
  deleteComportement,
  deleteDepartement,
  deleteEspece,
  deleteEstimationDistance,
  deleteEstimationNombre,
  deleteLieudit,
  deleteMeteo,
  deleteMilieu,
  deleteSexe,
  exportAges,
  exportClasses,
  exportCommunes,
  exportComportements,
  exportDepartements,
  exportEspeces,
  exportEstimationsDistance,
  exportEstimationsNombre,
  exportLieuxdits,
  exportMeteos,
  exportMilieux,
  exportObservateurs,
  exportSexes,
  getAges,
  getClasses,
  getCommunes,
  getComportements,
  getDepartements,
  getEspeceDetailsByAge,
  getEspeceDetailsBySexe,
  getEspeces,
  getEstimationsDistance,
  getEstimationsNombre,
  getLieuxdits,
  getMeteos,
  getMilieux,
  getObservateurs,
  getSexes,
  removeObservateur,
  saveAge,
  saveClasse,
  saveCommune,
  saveComportement,
  saveDepartement,
  saveEspece,
  saveEstimationDistance,
  saveEstimationNombre,
  saveLieudit,
  saveMeteo,
  saveMilieu,
  saveObservateur,
  saveSexe
} from "./requests/gestion";
import {
  importAges,
  importClasses,
  importCommunes,
  importComportements,
  importDepartements,
  importDonnees,
  importEspeces,
  importEstimationsDistance,
  importEstimationsNombre,
  importLieuxdits,
  importMeteos,
  importMilieux,
  importObservateurs,
  importSexes
} from "./requests/import";
import { saveDatabase, saveDatabaseFileName } from "./requests/save";
import {
  exportDonneesByCustomizedFilters,
  getDonneesByCustomizedFilters
} from "./requests/view";

const CSV_MIME_TYPE = "text/csv";
const EXCEL_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const REQUEST_MAPPING: {
  [path: string]: (
    httpParameters?: HttpParameters
  ) => Promise<any>;
} = {
  "/api/inventaire/save": saveInventaire,
  "/api/inventaire/find": getInventaireById,
  "/api/inventaire/find_id": getInventaireIdById,
  "/api/donnee/search": getDonneesByCustomizedFilters,
  "/api/donnee/export": exportDonneesByCustomizedFilters,
  "/api/donnee/save": saveDonnee,
  "/api/donnee/delete": deleteDonnee,
  "/api/donnee/last": getLastDonneeId,
  "/api/donnee/next_regroupement": getNextRegroupement,
  "/api/donnee/find_with_context": getDonneeByIdWithContext,
  "/api/donnee/import": importDonnees,
  "/api/observateur/all": getObservateurs,
  "/api/observateur/save": saveObservateur,
  "/api/observateur/delete": removeObservateur,
  "/api/observateur/import": importObservateurs,
  "/api/observateur/export": exportObservateurs,
  "/api/departement/all": getDepartements,
  "/api/departement/save": saveDepartement,
  "/api/departement/delete": deleteDepartement,
  "/api/departement/import": importDepartements,
  "/api/departement/export": exportDepartements,
  "/api/commune/all": getCommunes,
  "/api/commune/save": saveCommune,
  "/api/commune/delete": deleteCommune,
  "/api/commune/import": importCommunes,
  "/api/commune/export": exportCommunes,
  "/api/lieudit/all": getLieuxdits,
  "/api/lieudit/save": saveLieudit,
  "/api/lieudit/delete": deleteLieudit,
  "/api/lieudit/import": importLieuxdits,
  "/api/lieudit/export": exportLieuxdits,
  "/api/meteo/all": getMeteos,
  "/api/meteo/save": saveMeteo,
  "/api/meteo/delete": deleteMeteo,
  "/api/meteo/import": importMeteos,
  "/api/meteo/export": exportMeteos,
  "/api/classe/all": getClasses,
  "/api/classe/save": saveClasse,
  "/api/classe/delete": deleteClasse,
  "/api/classe/import": importClasses,
  "/api/classe/export": exportClasses,
  "/api/espece/all": getEspeces,
  "/api/espece/save": saveEspece,
  "/api/espece/delete": deleteEspece,
  "/api/espece/details_by_age": getEspeceDetailsByAge,
  "/api/espece/details_by_sexe": getEspeceDetailsBySexe,
  "/api/espece/import": importEspeces,
  "/api/espece/export": exportEspeces,
  "/api/sexe/all": getSexes,
  "/api/sexe/save": saveSexe,
  "/api/sexe/delete": deleteSexe,
  "/api/sexe/import": importSexes,
  "/api/sexe/export": exportSexes,
  "/api/age/all": getAges,
  "/api/age/save": saveAge,
  "/api/age/delete": deleteAge,
  "/api/age/import": importAges,
  "/api/age/export": exportAges,
  "/api/estimation-nombre/all": getEstimationsNombre,
  "/api/estimation-nombre/save": saveEstimationNombre,
  "/api/estimation-nombre/delete": deleteEstimationNombre,
  "/api/estimation-nombre/import": importEstimationsNombre,
  "/api/estimation-nombre/export": exportEstimationsNombre,
  "/api/estimation-distance/all": getEstimationsDistance,
  "/api/estimation-distance/save": saveEstimationDistance,
  "/api/estimation-distance/delete": deleteEstimationDistance,
  "/api/estimation-distance/import": importEstimationsDistance,
  "/api/estimation-distance/export": exportEstimationsDistance,
  "/api/comportement/all": getComportements,
  "/api/comportement/save": saveComportement,
  "/api/comportement/delete": deleteComportement,
  "/api/comportement/import": importComportements,
  "/api/comportement/export": exportComportements,
  "/api/milieu/all": getMilieux,
  "/api/milieu/save": saveMilieu,
  "/api/milieu/delete": deleteMilieu,
  "/api/milieu/import": importMilieux,
  "/api/milieu/export": exportMilieux,
  "/api/configuration/all": getAppConfiguration,
  "/api/configuration/update": configurationUpdate,
  "/api/database/save": saveDatabase
};

export const REQUEST_METHODS: { [key: string]: HttpMethod[] } = {
  "/api/configuration/all": ["GET"],
  "/api/configuration/update": ["POST"]
};

// Mapping between the api requested and the media type (MIME) of the response
export const REQUEST_MEDIA_TYPE_RESPONSE_MAPPING = {
  "/api/database/save": "application/sql",
  "/api/observateur/import": CSV_MIME_TYPE,
  "/api/departement/import": CSV_MIME_TYPE,
  "/api/commune/import": CSV_MIME_TYPE,
  "/api/lieudit/import": CSV_MIME_TYPE,
  "/api/meteo/import": CSV_MIME_TYPE,
  "/api/classe/import": CSV_MIME_TYPE,
  "/api/espece/import": CSV_MIME_TYPE,
  "/api/sexe/import": CSV_MIME_TYPE,
  "/api/age/import": CSV_MIME_TYPE,
  "/api/estimation-nombre/import": CSV_MIME_TYPE,
  "/api/estimation-distance/import": CSV_MIME_TYPE,
  "/api/milieu/import": CSV_MIME_TYPE,
  "/api/comportement/import": CSV_MIME_TYPE,
  "/api/donnee/import": CSV_MIME_TYPE,
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
  "/api/donnee/export": EXCEL_MIME_TYPE
};

// List of api requests that expect to return a response as file attachment
// The value is actually a function that will return the file name to be used
export const REQUESTS_WITH_ATTACHMENT_FILE_NAME_RESPONSES: {
  [path: string]: () => string;
} = {
  "/api/database/save": saveDatabaseFileName
};
