import * as http from "http";
import WebSocket, { Server } from "ws";

export class WebsocketServer {
  private static wss: Server;

  public static createServer(server: http.Server): Server {
    this.wss = new Server({ server });
    return this.wss;
  }

  public static getServer(): Server {
    return this.wss;
  }

  public static sendMessageToClients(
    message: string,
    clients?: WebSocket | WebSocket[]
  ): void {
    const clientsToTarget = clients
      ? Array.isArray(clients)
        ? clients
        : [clients]
      : this.wss.clients;

    clientsToTarget.forEach((client: WebSocket) => {
      client.send(message);
    });
  }
}
