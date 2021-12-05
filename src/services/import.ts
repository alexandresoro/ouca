import { isMainThread, parentPort, Worker, workerData } from "worker_threads";
import WebSocket from "ws";
import { OngoingSubStatus } from "../model/graphql";
import { ImportErrorMessage, ImportFailureMessage, ImportNotifyProgressMessage, ImportNotifyProgressMessageContent, ImportNotifyStatusUpdateMessage, ImportPostCompleteMessage, ImportUpdateMessage, IMPORT_COMPLETE, IMPORT_FAILED, IMPORT_GLOBAL_ERROR, VALIDATION_PROGRESS } from "../model/import/import-update-message";
import { WebsocketImportRequestContent } from "../model/websocket/websocket-import-request-message";
import { WebsocketImportUpdateMessage } from "../model/websocket/websocket-import-update-message";
import { IMPORT } from "../model/websocket/websocket-message-type.model";
import { logger } from "../utils/logger";
import { IMPORT_COMPLETE_EVENT, IMPORT_FAILED_EVENT, IMPORT_PROGRESS_UPDATE_EVENT, IMPORT_STATUS_UPDATE_EVENT } from "./import/import-service";
import { getNewImportServiceForRequestType } from "./import/import-service-per-request-type";

// Worker thread for the import
if (!isMainThread) {
  const importData = workerData as WebsocketImportRequestContent;

  const serviceWorker = getNewImportServiceForRequestType(importData.dataType);

  serviceWorker.on(IMPORT_PROGRESS_UPDATE_EVENT, (progressContent: ImportNotifyProgressMessageContent) => {
    const messageContent: ImportNotifyProgressMessage = {
      type: VALIDATION_PROGRESS,
      progress: progressContent
    }
    parentPort.postMessage(messageContent);
  });

  serviceWorker.on(IMPORT_STATUS_UPDATE_EVENT, (statusUpdate: ImportNotifyStatusUpdateMessage) => {
    parentPort.postMessage(statusUpdate);
  });

  serviceWorker.on(IMPORT_FAILED_EVENT, (failureReason?: string) => {

    const messageContent: ImportFailureMessage = {
      type: IMPORT_FAILED,
      failureReason
    };

    parentPort.postMessage(messageContent);
    process.exit(0);
  });

  serviceWorker.on(IMPORT_COMPLETE_EVENT, (importResult: string[][]) => {

    const messageContent: ImportPostCompleteMessage = {
      type: IMPORT_COMPLETE,
      lineErrors: importResult
    };

    parentPort.postMessage(messageContent);
    process.exit(0);
  });

  serviceWorker.importFile(importData.data).catch((error) => {
    throw error;
  });

}

const sendImportMessage = (message: ImportUpdateMessage | ImportErrorMessage, client: WebSocket): void => {
  const messageToClient: WebsocketImportUpdateMessage = {
    type: IMPORT,
    content: message
  }
  client.send(JSON.stringify(messageToClient));
}

const processImport = (workerData: WebsocketImportRequestContent, client: WebSocket): Promise<string> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      argv: process.argv.slice(2),
      workerData
    });

    worker.on('message', (postMessage: ImportUpdateMessage) => {

      if (postMessage.type === IMPORT_COMPLETE) {

        sendImportMessage(postMessage, client);

        resolve(postMessage.lineErrors?.toString());
      } else if (postMessage.type === IMPORT_FAILED) {

        sendImportMessage(postMessage, client);

        resolve(postMessage.failureReason);
      } else if ((postMessage.type === VALIDATION_PROGRESS || Object.values(OngoingSubStatus).includes(postMessage.type))) {
        sendImportMessage(postMessage, client);
      }

    });

    worker.on('error', (error) => {
      logger.warn(`Import failed with error ${JSON.stringify(error, null, 2)}`);

      const errorMessage: ImportErrorMessage = {
        type: IMPORT_GLOBAL_ERROR,
        error: JSON.stringify(error)
      };

      sendImportMessage(errorMessage, client);
      reject(error);
    });

    worker.on('exit', (exitCode) => {

      if (exitCode) {
        logger.warn(`Import failed with thread exit code ${exitCode}`);

        const errorMessage: ImportErrorMessage = {
          type: IMPORT_GLOBAL_ERROR,
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

  return processImport(importContent, client);
};
