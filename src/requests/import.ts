import { ImportResponse } from "basenaturaliste-model/import-response.object";
import { HttpParameters } from "../http/httpParameters";
import { ImportAgeService } from "../services/import/import-age-service";
import { ImportClasseService } from "../services/import/import-classe-service";
import { ImportCommuneService } from "../services/import/import-commune-service";
import { ImportComportementService } from "../services/import/import-comportement-service";
import { ImportDepartementService } from "../services/import/import-departement-service";
import { ImportEspeceService } from "../services/import/import-espece-service";
import { ImportEstimationDistanceService } from "../services/import/import-estimation-distance-service";
import { ImportEstimationNombreService } from "../services/import/import-estimation-nombre-service";
import { ImportLieuxditService } from "../services/import/import-lieudit-service";
import { ImportMeteoService } from "../services/import/import-meteo-service";
import { ImportMilieuService } from "../services/import/import-milieu-service";
import { ImportObservateurService } from "../services/import/import-observateur-service";
import { ImportSexeService } from "../services/import/import-sexe-service";

export const importObservateurs = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  const importService = new ImportObservateurService();
  return importService.importFile(httpParameters.postData);
};

export const importDepartements = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  const importService = new ImportDepartementService();
  return importService.importFile(httpParameters.postData);
};

export const importCommunes = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  const importService = new ImportCommuneService();
  return importService.importFile(httpParameters.postData);
};

export const importLieuxdits = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<ImportResponse> => {
  const importService = new ImportLieuxditService();
  return importService.importFile(httpParameters.postData);
};

export const importMeteos = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  const importService = new ImportMeteoService();
  return importService.importFile(httpParameters.postData);
};

export const importClasses = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  const importService = new ImportClasseService();
  return importService.importFile(httpParameters.postData);
};

export const importEspeces = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  const importService = new ImportEspeceService();
  return importService.importFile(httpParameters.postData);
};

export const importAges = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  const importService = new ImportAgeService();
  return importService.importFile(httpParameters.postData);
};

export const importSexes = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  const importService = new ImportSexeService();
  return importService.importFile(httpParameters.postData);
};

export const importEstimationsNombre = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  const importService = new ImportEstimationNombreService();
  return importService.importFile(httpParameters.postData);
};

export const importEstimationsDistance = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  const importService = new ImportEstimationDistanceService();
  return importService.importFile(httpParameters.postData);
};

export const importComportements = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  const importService = new ImportComportementService();
  return importService.importFile(httpParameters.postData);
};

export const importMilieux = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  const importService = new ImportMilieuService();
  return importService.importFile(httpParameters.postData);
};

export const importDonnees = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  // TODO
};
