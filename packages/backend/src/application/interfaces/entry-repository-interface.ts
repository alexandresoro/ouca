export type EntryRepository = {
  findLatestGrouping: () => Promise<number | null>;
  updateAssociatedInventory: (currentInventoryId: string, newInventoryId: string) => Promise<void>;
};
