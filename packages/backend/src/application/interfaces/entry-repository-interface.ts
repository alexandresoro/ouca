export type EntryRepository = {
  findLatestGrouping: () => Promise<number | null>;
};
