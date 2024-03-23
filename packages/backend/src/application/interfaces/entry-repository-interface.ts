import type { Entry, EntryCreateInput } from "@domain/entry/entry.js";
import type { SearchCriteria } from "@domain/search/search-criteria.js";

export type EntryRepository = {
  findEntryById(id: string): Promise<Entry | null>;
  findExistingEntry(criteria: EntryCreateInput): Promise<Entry | null>;
  getCount(criteria?: SearchCriteria | null): Promise<number>;
  createEntry(entryInput: EntryCreateInput): Promise<Entry>;
  updateEntry: (entryId: string, entryInput: EntryCreateInput) => Promise<Entry>;
  deleteEntryById: (entryId: string) => Promise<Entry | null>;
  findLatestGrouping: () => Promise<number | null>;
  updateAssociatedInventory: (currentInventoryId: string, newInventoryId: string) => Promise<void>;
};
