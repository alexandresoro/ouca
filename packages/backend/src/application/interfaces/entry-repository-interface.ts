import type { Entry } from "@domain/entry/entry.js";

export type EntryRepository = {
  findEntryById(id: string): Promise<Entry | null>;
  findLatestGrouping: () => Promise<number | null>;
  updateAssociatedInventory: (currentInventoryId: string, newInventoryId: string) => Promise<void>;
};
