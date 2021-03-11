import { ImportErrorMessage, ImportUpdateMessage } from "../import/import-update-message";
import { IMPORT } from "./websocket-message-type.model";

export type WebsocketImportUpdateMessage = {

  type: typeof IMPORT;

  content: ImportUpdateMessage | ImportErrorMessage;
}