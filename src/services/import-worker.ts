import { readFile } from "fs";
import path from "path";
import { promisify } from "util";
import { parentPort, workerData } from "worker_threads";
import { ImportType } from "../model/import-types";
import {
  ImportFailureMessage,
  ImportNotifyProgressMessage,
  ImportNotifyProgressMessageContent,
  ImportNotifyStatusUpdateMessage,
  ImportPostCompleteMessage,
  IMPORT_COMPLETE,
  IMPORT_FAILED,
  VALIDATION_PROGRESS
} from "../objects/import/import-update-message";
import { LoggedUser } from "../types/LoggedUser";
import { IMPORT_DIR } from "../utils/paths";
import {
  IMPORT_COMPLETE_EVENT,
  IMPORT_FAILED_EVENT,
  IMPORT_PROGRESS_UPDATE_EVENT,
  IMPORT_STATUS_UPDATE_EVENT
} from "./import/import-service";
import { getNewImportServiceForRequestType } from "./import/import-service-per-request-type";

const { importId, importType, loggedUser } = workerData as {
  importId: string;
  importType: ImportType;
  loggedUser: LoggedUser;
};

const serviceWorker = getNewImportServiceForRequestType(importType);

serviceWorker.on(IMPORT_PROGRESS_UPDATE_EVENT, (progressContent: ImportNotifyProgressMessageContent) => {
  const messageContent: ImportNotifyProgressMessage = {
    type: VALIDATION_PROGRESS,
    progress: progressContent
  };
  parentPort?.postMessage(messageContent);
});

serviceWorker.on(IMPORT_STATUS_UPDATE_EVENT, (statusUpdate: ImportNotifyStatusUpdateMessage) => {
  parentPort?.postMessage(statusUpdate);
});

serviceWorker.on(IMPORT_FAILED_EVENT, (failureReason?: string) => {
  const messageContent: ImportFailureMessage = {
    type: IMPORT_FAILED,
    failureReason
  };

  parentPort?.postMessage(messageContent);
  process.exit(0);
});

serviceWorker.on(IMPORT_COMPLETE_EVENT, (importResult: string[][]) => {
  const messageContent: ImportPostCompleteMessage = {
    type: IMPORT_COMPLETE,
    lineErrors: importResult
  };

  parentPort?.postMessage(messageContent);
  process.exit(0);
});

const IMPORTS_DIR_PATH = path.join(process.cwd(), IMPORT_DIR);

promisify(readFile)(path.join(IMPORTS_DIR_PATH, importId))
  .then((data) => {
    // This is the 100% CPU intensive task
    serviceWorker.importFile(data.toString(), loggedUser).catch((error) => {
      throw error;
    });
  })
  .catch((error) => {
    throw error;
  });
