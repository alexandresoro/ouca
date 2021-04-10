import { WebSocketMessageType } from "./websocket-message-type.model";

export type WebsocketMessage<T extends WebSocketMessageType = WebSocketMessageType, C = unknown> = {

  type: T;

  content?: C;
}
