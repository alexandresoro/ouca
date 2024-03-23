import type { EntryCreateInput } from "@domain/entry/entry.js";
import type { UpsertEntryInput } from "@ou-ca/common/api/entry";

export const reshapeInputEntryUpsertData = (data: UpsertEntryInput): EntryCreateInput => {
  const { regroupment, ...restEntry } = data;
  return {
    ...restEntry,
    grouping: regroupment,
  };
};
