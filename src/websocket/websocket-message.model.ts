import { WebSocketMessageType } from "./websocket-message-type.model";

export interface WebsocketMessage {
  type: WebSocketMessageType;

  content: string | any;
}
