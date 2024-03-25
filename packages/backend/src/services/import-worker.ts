import { parentPort, workerData } from "node:worker_threads";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { ImportType } from "@ou-ca/common/import/import-types";
import { buildServices } from "../application/services/services.js";
import {
  IMPORT_COMPLETE,
  IMPORT_FAILED,
  type ImportFailureMessage,
  type ImportNotifyProgressMessage,
  type ImportNotifyProgressMessageContent,
  type ImportNotifyStatusUpdateMessage,
  type ImportPostCompleteMessage,
  VALIDATION_PROGRESS,
} from "../objects/import/import-update-message.js";
import { logger } from "../utils/logger.js";
import { getNewImportServiceForRequestType } from "./import/import-service-per-request-type.js";
import {
  IMPORT_COMPLETE_EVENT,
  IMPORT_FAILED_EVENT,
  IMPORT_PROGRESS_UPDATE_EVENT,
  IMPORT_STATUS_UPDATE_EVENT,
} from "./import/import-service.js";

const { importId, importType, loggedUser } = workerData as {
  importId: string;
  importType: ImportType;
  loggedUser: LoggedUser;
};

const services = buildServices();

const serviceWorker = getNewImportServiceForRequestType(importType, services);

serviceWorker.on(IMPORT_PROGRESS_UPDATE_EVENT, (progressContent: ImportNotifyProgressMessageContent) => {
  const messageContent: ImportNotifyProgressMessage = {
    type: VALIDATION_PROGRESS,
    progress: progressContent,
  };
  parentPort?.postMessage(messageContent);
});

serviceWorker.on(IMPORT_STATUS_UPDATE_EVENT, (statusUpdate: ImportNotifyStatusUpdateMessage) => {
  parentPort?.postMessage(statusUpdate);
});

serviceWorker.on(IMPORT_FAILED_EVENT, (failureReason?: string) => {
  const messageContent: ImportFailureMessage = {
    type: IMPORT_FAILED,
    failureReason,
  };

  parentPort?.postMessage(messageContent);
  process.exit(0);
});

serviceWorker.on(IMPORT_COMPLETE_EVENT, (importResult: string[][]) => {
  const messageContent: ImportPostCompleteMessage = {
    type: IMPORT_COMPLETE,
    lineErrors: importResult,
  };

  parentPort?.postMessage(messageContent);
  process.exit(0);
});

const importData = await services.importService.getUploadData(importId);

if (importData === null) {
  logger.error(`No data found for import with id ${importId}`);
  process.exit(1);
}

await serviceWorker.importFile(importData, loggedUser).catch((error) => {
  throw error;
});
