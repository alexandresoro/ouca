import { ImportErrorMessage, ImportUpdateMessage } from "../import/import-update-message";
import { IMPORT } from "./websocket-message-type.model";
import { WebsocketMessage } from "./websocket-message.model";

export type WebsocketImportUpdateMessage = WebsocketMessage<typeof IMPORT, ImportUpdateMessage | ImportErrorMessage>;