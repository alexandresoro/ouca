import { type SearchCriteriaParams } from "@ou-ca/common/api/common/search-criteria";
import { type Species } from "@ou-ca/common/entities/species";
import { atom } from "jotai";

export const searchEntriesFilterSpeciesAtom = atom<Species[]>([]);

export const searchEntriesCriteriaAtom = atom((get) => {
  const speciesIds = get(searchEntriesFilterSpeciesAtom).map(({ id }) => id);
  return {
    speciesIds,
  } satisfies SearchCriteriaParams;
});
