import type { Inventory } from "@domain/inventory/inventory.js";

export type InventoryRepository = {
  findInventoryById(id: number): Promise<Inventory | null>;
  findInventoryByEntryId(entryId: string): Promise<Inventory | null>;
  getCount(): Promise<number>;
  getCountByLocality(localityId: string): Promise<number>;
  deleteInventoryById(inventoryId: string): Promise<Inventory | null>;
};
