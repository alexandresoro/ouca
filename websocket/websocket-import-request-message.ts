import { IMPORT } from "./websocket-message-type.model";

export const IMPORT_OBSERVATEUR = "observateur";
export const IMPORT_DEPARTEMENT = "departement";
export const IMPORT_COMMUNE = "commune";
export const IMPORT_LIEUDIT = "lieudit";
export const IMPORT_METEO = "meteo";
export const IMPORT_CLASSE = "classe";
export const IMPORT_ESPECE = "espece";
export const IMPORT_AGE = "age";
export const IMPORT_SEXE = "sexe";
export const IMPORT_ESTIMATION_NOMBRE = "estimationNombre";
export const IMPORT_ESTIMATION_DISTANCE = "estimationDistance";
export const IMPORT_COMPORTEMENT = "comportement";
export const IMPORT_MILIEU = "milieu";
export const IMPORT_INVENTAIRE = "inventaire";

export const IMPORT_DONNEE = "donnee";


export const IMPORT_TYPE = [IMPORT_OBSERVATEUR, IMPORT_DEPARTEMENT, IMPORT_COMMUNE, IMPORT_LIEUDIT, IMPORT_METEO, IMPORT_CLASSE, IMPORT_ESPECE, IMPORT_AGE, IMPORT_SEXE, IMPORT_ESTIMATION_NOMBRE, IMPORT_ESTIMATION_DISTANCE, IMPORT_COMPORTEMENT, IMPORT_MILIEU, IMPORT_INVENTAIRE, IMPORT_DONNEE] as const;

export type WebsocketImportRequestDataType = typeof IMPORT_TYPE;

export type WebsocketImportRequestContent = {
  dataType: WebsocketImportRequestDataType;
  data: string;
}

export type WebsocketImportRequestMessage = {

  type: typeof IMPORT;

  content: WebsocketImportRequestContent

}