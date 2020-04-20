import { WebsocketMessage } from "./websocket-message.model";
import { WebsocketUpdateContent } from "./websocket-update-content.model";

export interface WebsocketUpdateMessage extends WebsocketMessage {
  content: WebsocketUpdateContent;
}
