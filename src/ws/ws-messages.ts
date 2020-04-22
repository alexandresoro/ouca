import { WebsocketUpdateMessage } from "ouca-common/websocket/websocket-update-message";
import WebSocket from "ws";
import { getAppConfiguration } from "../requests/configuration";
import { findAllObservateurs } from "../sql-api/sql-api-observateur";
import { TABLE_OBSERVATEUR, TABLE_SETTINGS } from "../utils/constants";
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

export const sendInitialData = async (
  client: WebSocket | WebSocket[]
): Promise<void> => {
  await this.sendAppConfiguration(client);
  await this.sendObservateurs(client);
};
