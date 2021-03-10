import { parentPort, workerData } from "worker_threads";
import { ImportNotifyProgressMessage, ImportNotifyProgressMessageContent, ImportNotifyStatusUpdateMessage, ImportPostCompleteMessage, IMPORT_COMPLETE, VALIDATION_PROGRESS } from "../../model/import/import-update-message";
import { ImportCommuneService } from "./import-commune-service";
import { IMPORT_COMPLETE_EVENT, IMPORT_PROGRESS_UPDATE_EVENT, IMPORT_STATUS_UPDATE_EVENT } from "./import-service";

const serviceWorker = new ImportCommuneService();

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

serviceWorker.on(IMPORT_COMPLETE_EVENT, (importResult: string) => {
  const messageContent: ImportPostCompleteMessage = {
    type: IMPORT_COMPLETE,
    result: importResult
  }
  parentPort.postMessage(messageContent);
  process.exit(0);
});

serviceWorker.importFile(workerData).catch(() => {
  process.exit(1);
});

