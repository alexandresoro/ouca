import { type OngoingSubStatus } from "../../graphql/generated/graphql-types";

export const VALIDATION_PROGRESS = "VALIDATION_PROGRESS";

export const IMPORT_COMPLETE = "IMPORT_COMPLETE";

export const IMPORT_FAILED = "IMPORT_FAILED";

export type ImportNotifyProgressMessageContent = {
  status: string;
  totalEntries: number;
  entriesToBeValidated: number;
  validatedEntries: number;
  errors: number;
};

export type ImportNotifyStatusUpdateMessage = {
  type: OngoingSubStatus;
};

export type ImportNotifyProgressMessage = {
  type: typeof VALIDATION_PROGRESS;
  progress: ImportNotifyProgressMessageContent;
};

export type ImportPostCompleteMessage = {
  type: typeof IMPORT_COMPLETE;
  lineErrors?: string[][];
};

export type ImportFailureMessage = {
  type: typeof IMPORT_FAILED;
  failureReason?: string;
};

export type ImportUpdateMessage =
  | ImportNotifyStatusUpdateMessage
  | ImportNotifyProgressMessage
  | ImportPostCompleteMessage
  | ImportFailureMessage;
