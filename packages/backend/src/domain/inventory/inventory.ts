import type { AccessFailureReason } from "@domain/shared/failure-reason.js";

export type InventoryFailureReason = AccessFailureReason;

export type InventoryUpsertFailureReason =
  | InventoryFailureReason
  | "requiredDataNotFound"
  | {
      inventaireExpectedToBeUpdated: number;
      correspondingInventaireFound: string;
    };

export type InventoryUpdateFailureReason =
  | {
      type: InventoryUpsertFailureReason;
    }
  | {
      type: "similarInventoryAlreadyExists";
      correspondingInventoryFound: string;
    };

export type InventoryDeleteFailureReason = InventoryFailureReason | "inventoryStillInUse";
