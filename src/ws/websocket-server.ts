import WebSocket from "ws";

export const sendMessageToClients = (
  message: string,
  clients?: WebSocket | WebSocket[]
): void => {
  const clientsToTarget = Array.isArray(clients)
    ? clients
    : [clients]

  clientsToTarget?.forEach(client => {
    client.send(message);
  });
}
