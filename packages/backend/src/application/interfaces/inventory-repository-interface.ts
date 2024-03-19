import type { Inventory } from "@domain/inventory/inventory.js";

export type InventoryRepository = {
  findInventoryById(id: number): Promise<Inventory | null>;
  findInventoryByEntryId(entryId: string): Promise<Inventory | null>;
  deleteInventoryById(inventoryId: string): Promise<Inventory | null>;
};
