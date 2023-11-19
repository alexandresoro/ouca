import { type SearchCriteriaParams } from "@ou-ca/common/api/common/search-criteria";
import { type Behavior } from "@ou-ca/common/entities/behavior";
import { type Department } from "@ou-ca/common/entities/department";
import { type Species } from "@ou-ca/common/entities/species";
import { type Town } from "@ou-ca/common/entities/town";
import { type NicheurCode } from "@ou-ca/common/types/nicheur.model";
import { atom } from "jotai";

export const searchEntriesFilterFromDateAtom = atom<string | null>(null);

export const searchEntriesFilterToDateAtom = atom<string | null>(null);

export const searchEntriesFilterDepartmentsAtom = atom<Department[]>([]);

export const searchEntriesFilterTownsAtom = atom<Town[]>([]);

export const searchEntriesFilterSpeciesAtom = atom<Species[]>([]);

export const searchEntriesFilterBehaviorsAtom = atom<Behavior[]>([]);

export const searchEntriesFilterBreedersAtom = atom<NicheurCode[]>([]);

export const searchEntriesCriteriaAtom = atom((get) => {
  const fromDate = get(searchEntriesFilterFromDateAtom) ?? undefined;
  const toDate = get(searchEntriesFilterToDateAtom) ?? undefined;
  const departmentIds = get(searchEntriesFilterDepartmentsAtom).map(({ id }) => id);
  const townIds = get(searchEntriesFilterTownsAtom).map(({ id }) => id);
  const speciesIds = get(searchEntriesFilterSpeciesAtom).map(({ id }) => id);
  const behaviorIds = get(searchEntriesFilterBehaviorsAtom).map(({ id }) => id);
  const breeders = get(searchEntriesFilterBreedersAtom);
  return {
    fromDate,
    toDate,
    departmentIds,
    townIds,
    speciesIds,
    behaviorIds,
    breeders: breeders.length ? breeders : undefined,
  } satisfies SearchCriteriaParams;
});
