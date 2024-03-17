import type { AccessFailureReason } from "@domain/shared/failure-reason.js";

export type InventoryFailureReason = AccessFailureReason;

export type InventoryUpsertFailureReason = InventoryFailureReason | "requiredDataNotFound";

export type InventoryDeleteFailureReason = InventoryFailureReason | "inventoryStillInUse";
