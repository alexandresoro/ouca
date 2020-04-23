import { WebsocketUpdateMessage } from "ouca-common/websocket/websocket-update-message";
import WebSocket from "ws";
import { getAppConfiguration } from "../requests/configuration";
import { findAllAges } from "../sql-api/sql-api-age";
import { findAllClasses } from "../sql-api/sql-api-classe";
import { findAllCommunes } from "../sql-api/sql-api-commune";
import { findAllComportements } from "../sql-api/sql-api-comportement";
import { findAllDepartements } from "../sql-api/sql-api-departement";
import { findAllEspeces } from "../sql-api/sql-api-espece";
import { findAllEstimationsDistance } from "../sql-api/sql-api-estimation-distance";
import { findAllEstimationsNombre } from "../sql-api/sql-api-estimation-nombre";
import { findAllLieuxDits } from "../sql-api/sql-api-lieudit";
import { findAllMeteos } from "../sql-api/sql-api-meteo";
import { findAllMilieux } from "../sql-api/sql-api-milieu";
import { findAllObservateurs } from "../sql-api/sql-api-observateur";
import { findAllSexes } from "../sql-api/sql-api-sexe";
import {
  TABLE_AGE,
  TABLE_CLASSE,
  TABLE_COMMUNE,
  TABLE_COMPORTEMENT,
  TABLE_DEPARTEMENT,
  TABLE_ESPECE,
  TABLE_ESTIMATION_DISTANCE,
  TABLE_ESTIMATION_NOMBRE,
  TABLE_LIEUDIT,
  TABLE_METEO,
  TABLE_MILIEU,
  TABLE_OBSERVATEUR,
  TABLE_SETTINGS,
  TABLE_SEXE
} from "../utils/constants";
import { WebsocketServer } from "./websocket-server";
import { wrapObject } from "./ws-wrapper";

const createUpdateMessage = <T extends unknown>(
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

export const onTableUpdate = (tableName: string): void => {
  switch (tableName) {
    case TABLE_SETTINGS:
      this.sendAppConfiguration();
      break;
    case TABLE_OBSERVATEUR:
      this.sendObservateurs();
      break;
    case TABLE_DEPARTEMENT:
      this.sendDepartements();
      break;
    case TABLE_COMMUNE:
      this.sendCommunes();
      break;
    case TABLE_LIEUDIT:
      this.sendLieuxdits();
      break;
    case TABLE_CLASSE:
      this.sendClasses();
      break;
    case TABLE_ESPECE:
      this.sendEspeces();
      break;
    case TABLE_SEXE:
      this.sendSexes();
      break;
    case TABLE_AGE:
      this.sendAges();
      break;
    case TABLE_ESTIMATION_DISTANCE:
      this.sendEstimationsDistance();
      break;
    case TABLE_ESTIMATION_NOMBRE:
      this.sendEstimationsNombre();
      break;
    case TABLE_COMPORTEMENT:
      this.sendComportements();
      break;
    case TABLE_MILIEU:
      this.sendMilieux();
      break;
    case TABLE_METEO:
      this.sendMeteos();
      break;
    default:
      break;
  }
};

export const sendAppConfiguration = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const appConfiguration = await getAppConfiguration();
  WebsocketServer.sendMessageToClients(
    createUpdateMessage(appConfiguration, "configuration"),
    target
  );
};

export const sendObservateurs = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const observateurs = await findAllObservateurs();
  WebsocketServer.sendMessageToClients(
    createUpdateMessage(observateurs, "observateurs"),
    target
  );
};

export const sendLieuxdits = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const lieuxdits = await findAllLieuxDits();
  WebsocketServer.sendMessageToClients(
    createUpdateMessage(lieuxdits, "lieuxdits"),
    target
  );
};

export const sendCommunes = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const communes = await findAllCommunes();
  WebsocketServer.sendMessageToClients(
    createUpdateMessage(communes, "communes"),
    target
  );
};

export const sendDepartements = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const departements = await findAllDepartements();
  WebsocketServer.sendMessageToClients(
    createUpdateMessage(departements, "departements"),
    target
  );
};

export const sendClasses = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const classes = await findAllClasses();
  WebsocketServer.sendMessageToClients(
    createUpdateMessage(classes, "classes"),
    target
  );
};

export const sendEspeces = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const especes = await findAllEspeces();
  WebsocketServer.sendMessageToClients(
    createUpdateMessage(especes, "especes"),
    target
  );
};

export const sendSexes = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const sexes = await findAllSexes();
  WebsocketServer.sendMessageToClients(
    createUpdateMessage(sexes, "sexes"),
    target
  );
};

export const sendAges = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const ages = await findAllAges();
  WebsocketServer.sendMessageToClients(
    createUpdateMessage(ages, "ages"),
    target
  );
};

export const sendEstimationsDistance = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const estimationsDistance = await findAllEstimationsDistance();
  WebsocketServer.sendMessageToClients(
    createUpdateMessage(estimationsDistance, "estimationsDistance"),
    target
  );
};

export const sendEstimationsNombre = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const estimationsNombre = await findAllEstimationsNombre();
  WebsocketServer.sendMessageToClients(
    createUpdateMessage(estimationsNombre, "estimationsNombre"),
    target
  );
};

export const sendComportements = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const comportements = await findAllComportements();
  WebsocketServer.sendMessageToClients(
    createUpdateMessage(comportements, "comportements"),
    target
  );
};

export const sendMilieux = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const milieux = await findAllMilieux();
  WebsocketServer.sendMessageToClients(
    createUpdateMessage(milieux, "milieux"),
    target
  );
};

export const sendMeteos = async (
  target?: WebSocket | WebSocket[]
): Promise<void> => {
  const meteos = await findAllMeteos();
  WebsocketServer.sendMessageToClients(
    createUpdateMessage(meteos, "meteos"),
    target
  );
};

export const sendInitialData = async (
  client: WebSocket | WebSocket[]
): Promise<void> => {
  await this.sendAppConfiguration(client);
  await this.sendObservateurs(client);
  await this.sendLieuxdits(client);
  await this.sendCommunes(client);
  await this.sendDepartements(client);
  await this.sendClasses(client);
  await this.sendEspeces(client);
  await this.sendSexes(client);
  await this.sendAges(client);
  await this.sendEstimationsDistance(client);
  await this.sendEstimationsNombre(client);
  await this.sendComportements(client);
  await this.sendMilieux(client);
  await this.sendMeteos(client);
};
