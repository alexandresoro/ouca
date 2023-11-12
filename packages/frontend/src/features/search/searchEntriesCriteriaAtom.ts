import { type SearchCriteriaParams } from "@ou-ca/common/api/common/search-criteria";
import { type Behavior } from "@ou-ca/common/entities/behavior";
import { type Department } from "@ou-ca/common/entities/department";
import { type Species } from "@ou-ca/common/entities/species";
import { type Town } from "@ou-ca/common/entities/town";
import { atom } from "jotai";

export const searchEntriesFilterDepartmentsAtom = atom<Department[]>([]);

export const searchEntriesFilterTownsAtom = atom<Town[]>([]);

export const searchEntriesFilterSpeciesAtom = atom<Species[]>([]);

export const searchEntriesFilterBehaviorsAtom = atom<Behavior[]>([]);

export const searchEntriesCriteriaAtom = atom((get) => {
  const departmentIds = get(searchEntriesFilterDepartmentsAtom).map(({ id }) => id);
  const townIds = get(searchEntriesFilterTownsAtom).map(({ id }) => id);
  const speciesIds = get(searchEntriesFilterSpeciesAtom).map(({ id }) => id);
  const behaviorIds = get(searchEntriesFilterBehaviorsAtom).map(({ id }) => id);
  return {
    departmentIds,
    townIds,
    speciesIds,
    behaviorIds,
  } satisfies SearchCriteriaParams;
});
