export type EntryRepository = {
  findLatestGrouping: () => Promise<number | null>;
  updateAssociatedInventory: (currentInventaireId: string, newInventaireId: string) => Promise<void>;
};
