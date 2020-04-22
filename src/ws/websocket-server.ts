import * as http from "http";
import * as _ from "lodash";
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
      ? _.isArray(clients)
        ? clients
        : [clients]
      : this.wss.clients;

    clientsToTarget.forEach((client) => {
      client.send(message);
    });
  }
}
