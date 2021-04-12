export const VALIDATION_PROGRESS = "VALIDATION_PROGRESS";

export const IMPORT_PROCESS_STARTED = "IMPORT_PROCESS_STARTED";

export const RETRIEVE_DB_INFO_START = "RETRIEVE_DB_INFO_START";
export const DATA_VALIDATION_START = "DATA_VALIDATION_START";
export const INSERT_DB_START = "INSERT_DB_START";

export const STATUS_UPDATE = [IMPORT_PROCESS_STARTED, RETRIEVE_DB_INFO_START, DATA_VALIDATION_START, INSERT_DB_START] as const;

export type StatusUpdate = typeof STATUS_UPDATE[number];


export const IMPORT_COMPLETE = "IMPORT_COMPLETE";

export const IMPORT_ERROR = "IMPORT_ERROR";

export type ImportNotifyProgressMessageContent = {
  status: string,
  totalEntries: number,
  entriesToBeValidated: number,
  validatedEntries: number,
  errors: number
}

export type ImportNotifyStatusUpdateMessage = {
  type: StatusUpdate,
}

export type ImportNotifyProgressMessage = {
  type: typeof VALIDATION_PROGRESS,
  progress: ImportNotifyProgressMessageContent
}

export type ImportPostCompleteMessage = {
  type: typeof IMPORT_COMPLETE,
  fileInputError?: string,
  lineErrors?: string[][]
}

export type ImportErrorMessage = {
  type: typeof IMPORT_ERROR;
  error: string | number;
}

export type ImportUpdateMessage = ImportNotifyStatusUpdateMessage | ImportNotifyProgressMessage | ImportPostCompleteMessage;