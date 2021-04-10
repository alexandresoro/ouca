import { UPDATE } from "./websocket-message-type.model";
import { WebsocketMessage } from "./websocket-message.model";
import { WebsocketUpdateContent } from "./websocket-update-content.model";

export type WebsocketUpdateMessage = WebsocketMessage<typeof UPDATE, WebsocketUpdateContent>;
