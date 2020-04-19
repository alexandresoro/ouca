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
    clients: WebSocket | WebSocket[],
    message: any
  ): void {
    const clientsArray = _.isArray(clients) ? clients : [clients];

    const messageStr = JSON.stringify(message);

    clientsArray.forEach((client) => {
      client.send(messageStr);
    });
  }

  public static sendMessageToAllClients(message: any): void {
    const messageStr = JSON.stringify(message);

    this.wss.clients.forEach((client) => {
      client.send(messageStr);
    });
  }
}
