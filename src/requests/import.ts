import { ImportResponse } from "basenaturaliste-model/import-response.object";
import { HttpParameters } from "../http/httpParameters.js";
import { ImportLieuxditService } from "../services/import-lieuxdit-service.js";
import { SqlConnection } from "../sql/sql-connection.js";
import { getFindConfigurationByLibelleQuery } from "../sql/sql-queries-utils.js";

export const importObservateurs = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  // TODO
  const exportFolderPath = await getExportFolderPath();
  console.log(exportFolderPath);
};

export const importDepartements = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  // TODO
};

export const importCommunes = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  // TODO
};

export const importLieuxdits = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<ImportResponse> => {
  if (!httpParameters.postData) {
    return {
      isSuccessful: false,
      reasonForFailure: "Le contenu du fichier n'a pas pu être lu"
    };
  }

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
  // TODO
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

const getExportFolderPath = async (): Promise<string> => {
  const exportFolderPathResult = await SqlConnection.query(
    getFindConfigurationByLibelleQuery("export_folder_path")
  );
  return exportFolderPathResult[0].value;
};
