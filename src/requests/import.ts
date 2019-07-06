import { ImportResponse } from "../basenaturaliste-model/import-response.object";
import { HttpParameters } from "../http/httpParameters";
import { ImportCommuneService } from "../services/import-commune-service";
import { ImportDepartementService } from "../services/import-departement-service";
import { ImportEspeceService } from "../services/import-espece-service";
import { ImportLieuxditService } from "../services/import-lieudit-service";
import { ImportObservateurService } from "../services/import-observateur-service";
import { SqlConnection } from "../sql/sql-connection";
import { getFindConfigurationByLibelleQuery } from "../sql/sql-queries-utils";

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
  // TODO
};

export const importClasses = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  // TODO
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
  // TODO
};

export const importSexes = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  // TODO
};

export const importEstimationsNombre = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  // TODO
};

export const importEstimationsDistance = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  // TODO
};

export const importComportements = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  // TODO
};

export const importMilieux = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  // TODO
};

export const importDonnees = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  // TODO
};

export const getExportFolderPath = async (): Promise<string> => {
  const exportFolderPathResult = await SqlConnection.query(
    getFindConfigurationByLibelleQuery("export_folder_path")
  );
  return exportFolderPathResult[0].value;
};
