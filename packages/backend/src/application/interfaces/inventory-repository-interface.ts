import type { Inventory, InventoryCreateInput, InventoryFindManyInput } from "@domain/inventory/inventory.js";

export type InventoryRepository = {
  findInventoryById(id: number): Promise<Inventory | null>;
  findInventoryByEntryId(entryId: string): Promise<Inventory | null>;
  findInventoryIndex(
    id: string,
    options: {
      orderBy: NonNullable<InventoryFindManyInput["orderBy"]>;
      sortOrder: NonNullable<InventoryFindManyInput["sortOrder"]>;
    },
  ): Promise<number | null>;
  findInventories({ orderBy, sortOrder, offset, limit }: InventoryFindManyInput): Promise<Inventory[]>;
  findExistingInventory(criteria: InventoryCreateInput): Promise<Inventory | null>;
  getCount(): Promise<number>;
  getCountByLocality(localityId: string): Promise<number>;
  deleteInventoryById(inventoryId: string): Promise<Inventory | null>;
};
