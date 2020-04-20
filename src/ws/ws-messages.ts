import { WebsocketUpdateMessage } from "ouca-common/websocket/websocket-update-message";
import WebSocket from "ws";
import { getAppConfiguration } from "../requests/configuration";
import { WebsocketServer } from "./websocket-server";
import { wrapObject } from "./ws-wrapper";

const createUpdateMessage = (message: any, key: string): string => {
  const content = wrapObject(message, key);

  const updateObj: WebsocketUpdateMessage = {
    type: "update",
    content
  };

  return JSON.stringify(updateObj);
};

export const sendAppConfiguration = async (
  target: WebSocket | WebSocket[]
): Promise<void> => {
  const appConfiguration = await getAppConfiguration();
  WebsocketServer.sendMessageToClients(
    createUpdateMessage(appConfiguration, "configuration"),
    target
  );
};

export const sendAppConfigurationToAll = async (): Promise<void> => {
  const appConfiguration = await getAppConfiguration();
  WebsocketServer.sendMessageToAllClients(
    createUpdateMessage(appConfiguration, "configuration")
  );
};
