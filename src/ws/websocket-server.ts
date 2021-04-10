import * as http from "http";
import WebSocket, { Server } from "ws";

let wss: Server;

export const WebsocketServer = {

  createServer(server: http.Server): Server {
    if (!wss) {
      wss = new Server({ server });
    }
    return wss;
  },

  getServer(): Server {
    return wss;
  },

  sendMessageToClients(
    message: string,
    clients?: WebSocket | WebSocket[]
  ): void {
    const clientsToTarget = clients
      ? Array.isArray(clients)
        ? clients
        : [clients]
      : wss.clients;

    clientsToTarget.forEach((client: WebSocket) => {
      client.send(message);
    });
  }

} as const
