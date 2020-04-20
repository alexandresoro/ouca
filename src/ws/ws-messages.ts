import WebSocket from "ws";
import { getAppConfiguration } from "../requests/configuration";
import { WebsocketServer } from "./websocket-server";
import { wrapObject } from "./ws-wrapper";

export const sendAppConfiguration = async (
  target: WebSocket | WebSocket[]
): Promise<void> => {
  const appConfiguration = await getAppConfiguration();
  WebsocketServer.sendMessageToClients(
    target,
    wrapObject(appConfiguration, "configuration")
  );
};

export const sendAppConfigurationToAll = async (): Promise<void> => {
  const appConfiguration = await getAppConfiguration();
  WebsocketServer.sendMessageToAllClients(
    wrapObject(appConfiguration, "configuration")
  );
};
