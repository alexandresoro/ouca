import { type ImportType } from "@ou-ca/common/import/import-types";
import { readFile } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { parentPort, workerData } from "node:worker_threads";
import { getConfig } from "../infrastructure/config/config.js";
import {
  IMPORT_COMPLETE,
  IMPORT_FAILED,
  VALIDATION_PROGRESS,
  type ImportFailureMessage,
  type ImportNotifyProgressMessage,
  type ImportNotifyProgressMessageContent,
  type ImportNotifyStatusUpdateMessage,
  type ImportPostCompleteMessage,
} from "../objects/import/import-update-message.js";
import { type LoggedUser } from "../types/User.js";
import { logger } from "../utils/logger.js";
import { IMPORTS_DIR_PATH } from "../utils/paths.js";
import { getNewImportServiceForRequestType } from "./import/import-service-per-request-type.js";
import {
  IMPORT_COMPLETE_EVENT,
  IMPORT_FAILED_EVENT,
  IMPORT_PROGRESS_UPDATE_EVENT,
  IMPORT_STATUS_UPDATE_EVENT,
} from "./import/import-service.js";
import { buildServices } from "./services.js";

const { importId, importType, loggedUser } = workerData as {
  importId: string;
  importType: ImportType;
  loggedUser: LoggedUser;
};

(async () => {
  const config = getConfig();
  const services = await buildServices(config);

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

  promisify(readFile)(path.join(IMPORTS_DIR_PATH.pathname, importId))
    .then((data) => {
      // This is the 100% CPU intensive task
      serviceWorker.importFile(data.toString(), loggedUser).catch((error) => {
        throw error;
      });
    })
    .catch((error) => {
      throw error;
    });
})().catch((e) => {
  logger.error(e);
});
