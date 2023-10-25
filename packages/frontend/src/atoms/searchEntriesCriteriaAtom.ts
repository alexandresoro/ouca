import { type SearchCriteriaParams } from "@ou-ca/common/api/common/search-criteria";
import { type Behavior } from "@ou-ca/common/entities/behavior";
import { type Species } from "@ou-ca/common/entities/species";
import { atom } from "jotai";

export const searchEntriesFilterSpeciesAtom = atom<Species[]>([]);

export const searchEntriesFilterBehaviorsAtom = atom<Behavior[]>([]);

export const searchEntriesCriteriaAtom = atom((get) => {
  const speciesIds = get(searchEntriesFilterSpeciesAtom).map(({ id }) => id);
  const behaviorIds = get(searchEntriesFilterBehaviorsAtom).map(({ id }) => id);
  return {
    speciesIds,
    behaviorIds,
  } satisfies SearchCriteriaParams;
});
