import WebSocket from "ws";
import { WebsocketUpdateMessage } from "../model/websocket/websocket-update-message";
import { APPLICATION_DATA_VERSION } from "../services/database-migration/database-migration.service";
import { findAllAges } from "../services/entities/age-service";
import { findAllClasses } from "../services/entities/classe-service";
import { findAllCommunes } from "../services/entities/commune-service";
import { findAllComportements } from "../services/entities/comportement-service";
import { findAppConfiguration } from "../services/entities/configuration-service";
import { findAllDepartements } from "../services/entities/departement-service";
import { findAllEspeces } from "../services/entities/espece-service";
import { findAllEstimationsDistance } from "../services/entities/estimation-distance-service";
import { findAllEstimationsNombre } from "../services/entities/estimation-nombre-service";
import { findAllLieuxDits } from "../services/entities/lieu-dit-service";
import { findAllMeteos } from "../services/entities/meteo-service";
import { findAllMilieux } from "../services/entities/milieu-service";
import { findAllObservateurs } from "../services/entities/observateur-service";
import { findAllSexes } from "../services/entities/sexe-service";
import { findVersion } from "../services/entities/version-service";
import { ImportableTable, TABLE_AGE, TABLE_CLASSE, TABLE_COMMUNE, TABLE_COMPORTEMENT, TABLE_DEPARTEMENT, TABLE_ESPECE, TABLE_ESTIMATION_DISTANCE, TABLE_ESTIMATION_NOMBRE, TABLE_LIEUDIT, TABLE_METEO, TABLE_MILIEU, TABLE_OBSERVATEUR, TABLE_SETTINGS, TABLE_SEXE } from "../utils/constants";
import { sendMessageToClients } from "./websocket-server";
import { wrapObject } from "./ws-wrapper";

const createUpdateMessage = <T = unknown>(
  message: T,
  key: string
): string => {
  const content = wrapObject(message, key);

  const updateObj: WebsocketUpdateMessage = {
    type: "update",
    content
  };

  return JSON.stringify(updateObj);
};

export const onTableUpdate = (tableName: ImportableTable | string): void => {
  switch (tableName) {
    case TABLE_SETTINGS:
      void sendAppConfiguration();
      break;
    case TABLE_OBSERVATEUR:
      void sendObservateurs();
      break;
    case TABLE_DEPARTEMENT:
      void sendDepartements();
      break;
    case TABLE_COMMUNE:
      void sendCommunes();
      break;
    case TABLE_LIEUDIT:
      void sendLieuxdits();
      break;
    case TABLE_CLASSE:
      void sendClasses();
      break;
    case TABLE_ESPECE:
      void sendEspeces();
      break;
    case TABLE_SEXE:
      void sendSexes();
      break;
    case TABLE_AGE:
      void sendAges();
      break;
    case TABLE_ESTIMATION_DISTANCE:
      void sendEstimationsDistance();
      break;
    case TABLE_ESTIMATION_NOMBRE:
      void sendEstimationsNombre();
      break;
    case TABLE_COMPORTEMENT:
      void sendComportements();
      break;
    case TABLE_MILIEU:
      void sendMilieux();
      break;
    case TABLE_METEO:
      void sendMeteos();
      break;
    default:
      break;
  }
};

export const sendAppConfiguration = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const appConfiguration = await findAppConfiguration();
  sendMessageToClients(
    createUpdateMessage(appConfiguration, "configuration"),
    target
  );
};

export const sendObservateurs = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const observateurs = await findAllObservateurs();
  sendMessageToClients(
    createUpdateMessage(observateurs, "observateurs"),
    target
  );
};

export const sendLieuxdits = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const lieuxdits = await findAllLieuxDits();
  sendMessageToClients(
    createUpdateMessage(lieuxdits, "lieuxdits"),
    target
  );
};

export const sendCommunes = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const communes = await findAllCommunes();
  sendMessageToClients(
    createUpdateMessage(communes, "communes"),
    target
  );
};

export const sendDepartements = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const departements = await findAllDepartements();
  sendMessageToClients(
    createUpdateMessage(departements, "departements"),
    target
  );
};

export const sendClasses = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const classes = await findAllClasses();
  sendMessageToClients(
    createUpdateMessage(classes, "classes"),
    target
  );
};

export const sendEspeces = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const especes = await findAllEspeces();
  sendMessageToClients(
    createUpdateMessage(especes, "especes"),
    target
  );
};

export const sendSexes = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const sexes = await findAllSexes();
  sendMessageToClients(
    createUpdateMessage(sexes, "sexes"),
    target
  );
};

export const sendAges = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const ages = await findAllAges();
  sendMessageToClients(
    createUpdateMessage(ages, "ages"),
    target
  );
};

export const sendEstimationsDistance = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const estimationsDistance = await findAllEstimationsDistance();
  sendMessageToClients(
    createUpdateMessage(estimationsDistance, "estimationsDistance"),
    target
  );
};

export const sendEstimationsNombre = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const estimationsNombre = await findAllEstimationsNombre();
  sendMessageToClients(
    createUpdateMessage(estimationsNombre, "estimationsNombre"),
    target
  );
};

export const sendComportements = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const comportements = await findAllComportements();
  sendMessageToClients(
    createUpdateMessage(comportements, "comportements"),
    target
  );
};

export const sendMilieux = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const milieux = await findAllMilieux();
  sendMessageToClients(
    createUpdateMessage(milieux, "milieux"),
    target
  );
};

export const sendMeteos = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const meteos = await findAllMeteos();
  sendMessageToClients(
    createUpdateMessage(meteos, "meteos"),
    target
  );
};

export const sendInitialData = async (
  client: WebSocket | WebSocket[]
): Promise<void> => {
  const appConfiguration = await findAppConfiguration();
  const observateurs = await findAllObservateurs();
  const lieuxdits = await findAllLieuxDits();
  const communes = await findAllCommunes();
  const departements = await findAllDepartements();
  const classes = await findAllClasses();
  const especes = await findAllEspeces();
  const sexes = await findAllSexes();
  const ages = await findAllAges();
  const estimationsDistance = await findAllEstimationsDistance();
  const estimationsNombre = await findAllEstimationsNombre();
  const comportements = await findAllComportements();
  const milieux = await findAllMilieux();
  const meteos = await findAllMeteos();
  const dbVersion = await findVersion();

  const initialDataContent = {
    configuration: appConfiguration,
    observateurs,
    lieuxdits,
    communes,
    departements,
    classes,
    especes,
    sexes,
    ages,
    estimationsDistance,
    estimationsNombre,
    comportements,
    milieux,
    meteos,
    version: {
      database: dbVersion,
      application: APPLICATION_DATA_VERSION
    }
  };

  const initialData: WebsocketUpdateMessage = {
    type: "update",
    content: initialDataContent
  };

  sendMessageToClients(JSON.stringify(initialData), client);
};
