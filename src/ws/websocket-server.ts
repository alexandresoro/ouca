import WebSocket, { Server } from "ws";

let wss: Server;

export const setWebsocketServer = (wssServer: Server): void => {
  wss = wssServer;
}

export const sendMessageToClients = (
  message: string,
  client: WebSocket
): void => {
  const clientsToTarget = client
    ? [client]
    : [...wss.clients];

  clientsToTarget?.forEach(client => {
    client.send(message);
  });
}
