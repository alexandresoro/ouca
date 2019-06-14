import fs from "fs";
import readline from "readline";
import { HttpParameters } from "../http/httpParameters.js";
export const importFile = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  const myInterface = readline.createInterface({
    input: fs.createReadStream("file.csv")
  });

  let lineno = 0;
  myInterface.on("line", (line) => {
    lineno++;
    console.log("Line number " + lineno + ": " + line);
  });
  console.log("toto");
};

export const importObservateurs = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  // TODO
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
): Promise<any> => {
  // TODO
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
