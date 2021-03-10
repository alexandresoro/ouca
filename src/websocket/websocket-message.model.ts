import { WebSocketMessageType } from "./websocket-message-type.model";

export type WebsocketMessage = {

  type: WebSocketMessageType;

  content: string | any;
}
