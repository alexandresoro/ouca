import { startWorker } from "@infrastructure/bullmq/worker.js";
import type { ImportStatus } from "@ou-ca/common/import/import-status";
import type { ImportService } from "../../services/import/import-service.js";

const SANDBOXED_WORKER_PATH = new URL("./import-worker-sandboxed.js", import.meta.url);

type WorkerImportDependencies = {
  importService: ImportService;
};

export const startImportWorker = ({ importService }: WorkerImportDependencies): void => {
  const importWorker = startWorker("import", SANDBOXED_WORKER_PATH, {
    useWorkerThreads: false,
  });

  importWorker.on("progress", (_, progress) => {
    // if (job.id) {
    //   void job.extendLock(job.id, 1000 * 60); // Extend lock for 1 minute after each progress update
    // }
    void importService.writeImportStatus(progress as ImportStatus);
  });
};
