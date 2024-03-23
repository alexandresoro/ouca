import type { Entry, EntryCreateInput } from "@domain/entry/entry.js";

export type EntryRepository = {
  findEntryById(id: string): Promise<Entry | null>;
  updateEntry: (entryId: string, entryInput: EntryCreateInput) => Promise<Entry>;
  deleteEntryById: (entryId: string) => Promise<Entry | null>;
  findLatestGrouping: () => Promise<number | null>;
  updateAssociatedInventory: (currentInventoryId: string, newInventoryId: string) => Promise<void>;
};
