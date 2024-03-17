import type { AccessFailureReason } from "@domain/shared/failure-reason.js";

export type EntryFailureReason = AccessFailureReason;

export type EntryUpsertFailureReason =
  | {
      type: EntryFailureReason;
    }
  | {
      type: "similarEntryAlreadyExists";
      correspondingEntryFound: string;
    };
