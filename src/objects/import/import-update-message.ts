import { OngoingSubStatus } from "../../model/graphql";

export const VALIDATION_PROGRESS = "VALIDATION_PROGRESS";

export const ON_DEMAND_STATUS = "ON_DEMAND_STATUS";

export const IMPORT_COMPLETE = "IMPORT_COMPLETE";

export const IMPORT_FAILED = "IMPORT_FAILED";

export const IMPORT_GLOBAL_ERROR = "IMPORT_GLOBAL_ERROR";

export type ImportNotifyProgressMessageContent = {
  status: string,
  totalEntries: number,
  entriesToBeValidated: number,
  validatedEntries: number,
  errors: number
}

export type ImportNotifyStatusUpdateMessage = {
  type: OngoingSubStatus,
}

export type ImportNotifyProgressMessage = {
  type: typeof VALIDATION_PROGRESS,
  progress: ImportNotifyProgressMessageContent
}

export type ImportPostCompleteMessage = {
  type: typeof IMPORT_COMPLETE,
  lineErrors?: string[][]
}

export type ImportFailureMessage = {
  type: typeof IMPORT_FAILED,
  failureReason?: string,
}

export type ImportErrorMessage = {
  type: typeof IMPORT_GLOBAL_ERROR;
  error: string | number;
}

export type ImportUpdateMessage = ImportNotifyStatusUpdateMessage | ImportNotifyProgressMessage | ImportPostCompleteMessage | ImportFailureMessage;