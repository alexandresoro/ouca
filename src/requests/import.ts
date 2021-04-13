import { Worker } from "worker_threads";
import WebSocket from "ws";
import { ImportErrorMessage, ImportUpdateMessage, IMPORT_COMPLETE, IMPORT_ERROR, STATUS_UPDATE, VALIDATION_PROGRESS } from "../model/import/import-update-message";
import { IMPORT_ESTIMATION_DISTANCE, IMPORT_ESTIMATION_NOMBRE, WebsocketImportRequestContent } from "../model/websocket/websocket-import-request-message";
import { WebsocketImportUpdateMessage } from "../model/websocket/websocket-import-update-message";
import { IMPORT } from "../model/websocket/websocket-message-type.model";
import { ImportableTable, TABLE_ESTIMATION_DISTANCE, TABLE_ESTIMATION_NOMBRE } from "../utils/constants";
import { logger } from "../utils/logger";
import { WebsocketServer } from "../ws/websocket-server";
import { onTableUpdate } from "../ws/ws-messages";

const sendImportMessage = (message: ImportUpdateMessage | ImportErrorMessage, client: WebSocket): void => {
  const messageToClient: WebsocketImportUpdateMessage = {
    type: IMPORT,
    content: message
  }
  WebsocketServer.sendMessageToClients(JSON.stringify(messageToClient), client);
}

const processImport = (workerPath: string, workerData: WebsocketImportRequestContent, tableToUpdate: ImportableTable, client: WebSocket): Promise<string> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerPath, {
      workerData
    });

    worker.on('message', (postMessage: ImportUpdateMessage) => {

      if (postMessage.type === IMPORT_COMPLETE) {

        sendImportMessage(postMessage, client);

        // When an import has been processed, 
        // inform all clients
        // Compared to the standard update, we need to to it manually here
        // once the worker has returned, as it is another "thread" 
        // that does not have the proper visibility
        onTableUpdate(tableToUpdate);

        resolve(postMessage.fileInputError ?? postMessage.lineErrors?.toString());
      } else if (postMessage.type === VALIDATION_PROGRESS || STATUS_UPDATE.includes(postMessage.type)) {
        sendImportMessage(postMessage, client);
      }

    });

    worker.on('error', (error) => {
      logger.warn(`Import failed with error ${JSON.stringify(error, null, 2)}`);

      const errorMessage: ImportErrorMessage = {
        type: IMPORT_ERROR,
        error: JSON.stringify(error)
      };

      sendImportMessage(errorMessage, client);
      reject(error);
    });

    worker.on('exit', (exitCode) => {

      if (exitCode) {
        logger.warn(`Import failed with thread exit code ${exitCode}`);

        const errorMessage: ImportErrorMessage = {
          type: IMPORT_ERROR,
          error: exitCode
        };

        sendImportMessage(errorMessage, client);
        reject(exitCode);
      }

    });

  });
}

export const importWebsocket = async (
  client: WebSocket,
  importContent: WebsocketImportRequestContent
): Promise<string> => {

  let tableToUpdate: ImportableTable;
  if (importContent.dataType === IMPORT_ESTIMATION_NOMBRE) {
    tableToUpdate = TABLE_ESTIMATION_NOMBRE;
  } else if (importContent.dataType === IMPORT_ESTIMATION_DISTANCE) {
    tableToUpdate = TABLE_ESTIMATION_DISTANCE;
  } else {
    tableToUpdate = importContent.dataType;
  }

  return processImport('./services/import/import-worker.js', importContent, tableToUpdate, client);
};
