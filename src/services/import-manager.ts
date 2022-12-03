import { stringify } from "csv-stringify/sync";
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { Worker } from "node:worker_threads";
import {
  ImportErrorType,
  ImportStatusEnum,
  OngoingSubStatus,
  type ImportStatus,
  type OngoingValidationStats,
} from "../graphql/generated/graphql-types";
import { type ImportType } from "../model/import-types";
import {
  IMPORT_COMPLETE,
  IMPORT_FAILED,
  VALIDATION_PROGRESS,
  type ImportUpdateMessage,
} from "../objects/import/import-update-message";
import { type LoggedUser } from "../types/User";
import { logger } from "../utils/logger";
import { DOWNLOAD_ENDPOINT, IMPORT_REPORTS_DIR, PUBLIC_DIR_PATH } from "../utils/paths";

const importStatuses: Map<string, ImportStatusStructure> = new Map();

type ImportStatusStructure = {
  status: ImportStatusEnum;
  worker: Worker;
  owner: LoggedUser;
  statusDetails?: unknown;
};

type ImportOngoingStructure = {
  status: typeof ImportStatusEnum.Ongoing;
  worker: Worker;
  owner: LoggedUser;
  statusDetails?: {
    subStatus: OngoingSubStatus;
    ongoingValidationStats?: OngoingValidationStats;
  };
};

type ImportCompleteStructure = {
  status: typeof ImportStatusEnum.Complete;
  worker: Worker;
  owner: LoggedUser;
  statusDetails?: {
    importErrorsReportFile?: string | undefined;
    nbErrors?: number | undefined;
  };
};

type ImportGlobalErrorStructure = {
  status: typeof ImportStatusEnum.Failed;
  worker: Worker;
  owner: LoggedUser;
  statusDetails?: {
    type: ImportErrorType;
    description: number | string | undefined;
  };
};

export const startImportTask = (importId: string, importType: ImportType, loggedUser: LoggedUser) => {
  logger.debug(
    `Creating new worker for import id ${importId} and type ${importType} initiatied by user ${loggedUser.id}`
  );

  const worker = new Worker("./services/import-worker.js", {
    argv: process.argv.slice(2),
    workerData: {
      importId,
      importType,
      loggedUser,
    },
  });

  worker.on("message", (postMessage: ImportUpdateMessage) => {
    if (postMessage.type === IMPORT_COMPLETE) {
      // Create the report file if any
      let importReportId: string | undefined = undefined;
      if (postMessage.lineErrors) {
        importReportId = randomUUID();
        const csvString = stringify(postMessage.lineErrors, {
          delimiter: ";",
          record_delimiter: "windows",
        });
        writeFileSync(path.join(PUBLIC_DIR_PATH, IMPORT_REPORTS_DIR, importReportId), csvString);
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const currentStatus = importStatuses.get(importId)!;
      const newStatus: ImportCompleteStructure = {
        ...currentStatus,
        status: ImportStatusEnum.Complete,
        ...(importReportId
          ? {
              statusDetails: {
                importErrorsReportFile: `${DOWNLOAD_ENDPOINT}${IMPORT_REPORTS_DIR}/${importReportId}`,
                nbErrors: postMessage?.lineErrors?.length ?? 0,
              },
            }
          : ({} as never)),
      };

      importStatuses.set(importId, newStatus);
    } else if (postMessage.type === IMPORT_FAILED) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const currentStatus = importStatuses.get(importId)!;
      const newStatus: ImportGlobalErrorStructure = {
        ...currentStatus,
        status: ImportStatusEnum.Failed,
        statusDetails: {
          type: ImportErrorType.ImportFailure,
          description: postMessage?.failureReason,
        },
      };
      importStatuses.set(importId, newStatus);
    } else if (postMessage.type === VALIDATION_PROGRESS) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const currentStatus = importStatuses.get(importId)!;
      const newStatus: ImportOngoingStructure = {
        ...currentStatus,
        status: ImportStatusEnum.Ongoing,
        statusDetails: {
          subStatus: OngoingSubStatus.ValidatingInputFile,
          ongoingValidationStats: {
            totalLines: postMessage?.progress?.totalEntries,
            totalEntries: postMessage?.progress?.entriesToBeValidated,
            nbEntriesChecked: postMessage?.progress?.validatedEntries,
            nbEntriesWithErrors: postMessage?.progress?.errors,
          },
        },
      };
      importStatuses.set(importId, newStatus);
    } else if (Object.values(OngoingSubStatus).includes(postMessage.type)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const currentStatus = importStatuses.get(importId)!;
      const newStatus: ImportOngoingStructure = {
        ...currentStatus,
        status: ImportStatusEnum.Ongoing,
        statusDetails: {
          subStatus: postMessage?.type,
        },
      };
      importStatuses.set(importId, newStatus);
    }
  });

  worker.on("error", (error) => {
    logger.warn({
      msgType: "Import error",
      importId,
      errorMsg: error,
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentStatus = importStatuses.get(importId)!;
    const newStatus: ImportGlobalErrorStructure = {
      ...currentStatus,
      status: ImportStatusEnum.Failed,
      statusDetails: {
        type: ImportErrorType.ImportProcessError,
        description: error?.message,
      },
    };
    importStatuses.set(importId, newStatus);
  });

  worker.on("exit", (exitCode) => {
    if (exitCode) {
      logger.warn({
        msgType: "Import thread error",
        importId,
        exitCode,
      });
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const currentStatus = importStatuses.get(importId)!;
      const newStatus: ImportGlobalErrorStructure = {
        ...currentStatus,
        status: ImportStatusEnum.Failed,
        statusDetails: {
          type: ImportErrorType.ImportProcessUnexpectedExit,
          description: exitCode,
        },
      };
      importStatuses.set(importId, newStatus);
    }
  });

  importStatuses.set(importId, {
    status: ImportStatusEnum.NotStarted,
    worker,
    owner: loggedUser,
  });
};

export const getImportStatus = (importId: string, loggedUser: LoggedUser): Promise<ImportStatus> | null => {
  if (!importStatuses.has(importId)) {
    // No status found for this import
    return null;
  }

  const importStatus = importStatuses.get(importId);

  // Check that the logged user is allowed to retrieve this status
  if (importStatus?.owner.id !== loggedUser.id && loggedUser.role !== "admin") {
    return null;
  }

  switch (importStatus?.status) {
    case ImportStatusEnum.NotStarted:
      // If the import task exists but has not yet started
      return Promise.resolve({
        status: importStatus.status,
      });
    case ImportStatusEnum.Failed:
      // If the import task has failed due to an unexpected error or a failure to treat the inported file
      return Promise.resolve({
        status: importStatus.status,
        errorType: (importStatus as ImportGlobalErrorStructure)?.statusDetails?.type,
        errorDescription: (importStatus as ImportGlobalErrorStructure)?.statusDetails?.description?.toString(),
      });
    case ImportStatusEnum.Complete:
      return Promise.resolve({
        status: importStatus.status,
        importErrorsReportFile: (importStatus as ImportCompleteStructure)?.statusDetails?.importErrorsReportFile,
        ...((importStatus as ImportCompleteStructure)?.statusDetails?.nbErrors
          ? {
              ongoingValidationStats: {
                nbEntriesWithErrors: (importStatus as ImportCompleteStructure)?.statusDetails?.nbErrors,
              },
            }
          : {}),
      });
    case ImportStatusEnum.Ongoing: {
      return Promise.resolve({
        status: importStatus.status,
        subStatus: (importStatus as ImportOngoingStructure)?.statusDetails?.subStatus,
        ongoingValidationStats: (importStatus as ImportOngoingStructure)?.statusDetails?.ongoingValidationStats,
      });
    }
    default:
      return null;
  }
};
