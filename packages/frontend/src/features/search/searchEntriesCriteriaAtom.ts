import { type SearchCriteriaParams } from "@ou-ca/common/api/common/search-criteria";
import { type AgeSimple } from "@ou-ca/common/api/entities/age";
import { type Behavior } from "@ou-ca/common/api/entities/behavior";
import { type Department } from "@ou-ca/common/api/entities/department";
import { type Environment } from "@ou-ca/common/api/entities/environment";
import { type Locality } from "@ou-ca/common/api/entities/locality";
import { type ObserverSimple } from "@ou-ca/common/api/entities/observer";
import { type Sex } from "@ou-ca/common/api/entities/sex";
import { type Species } from "@ou-ca/common/api/entities/species";
import { type SpeciesClass } from "@ou-ca/common/api/entities/species-class";
import { type Town } from "@ou-ca/common/api/entities/town";
import { type NicheurCode } from "@ou-ca/common/types/nicheur.model";
import { atom } from "jotai";

export const searchEntriesFilterObserversAtom = atom<ObserverSimple[]>([]);

export const searchEntriesFilterFromDateAtom = atom<string | null>(null);

export const searchEntriesFilterToDateAtom = atom<string | null>(null);

const searchEntriesFilterInternalDepartmentsAtom = atom<Department[]>([]);

export const searchEntriesFilterDepartmentsAtom = atom<Department[], [Department[]], unknown>(
  (get) => get(searchEntriesFilterInternalDepartmentsAtom),
  (get, set, departments) => {
    set(searchEntriesFilterInternalDepartmentsAtom, departments);

    // If more than one department is selected, reset the towns filter
    // Here we want to allow the user to select towns directly - without having to select a department first
    if (departments.length > 1) {
      set(searchEntriesFilterTownsInternalAtom, []);
    } else if (departments.length === 1) {
      // If only a single department is selected, set the towns filter to the towns of that department
      const townsOfDepartments = get(searchEntriesFilterTownsInternalAtom).filter(
        ({ departmentId }) => departmentId === departments[0].id,
      );
      set(searchEntriesFilterTownsInternalAtom, townsOfDepartments);
    }
  },
);

const searchEntriesFilterTownsInternalAtom = atom<Town[]>([]);

export const searchEntriesFilterTownsAtom = atom<Town[], [Town[]], unknown>(
  (get) => get(searchEntriesFilterTownsInternalAtom),
  (_, set, towns) => {
    set(searchEntriesFilterTownsInternalAtom, towns);

    // If no town is selected or more than one, reset the localities filter
    if (towns.length !== 1) {
      set(searchEntriesFilterLocalitiesAtom, []);
    }
  },
);

export const searchEntriesFilterLocalitiesAtom = atom<Locality[]>([]);

export const searchEntriesFilterClassesAtom = atom<SpeciesClass[]>([]);

export const searchEntriesFilterSpeciesAtom = atom<Species[]>([]);

export const searchEntriesFilterSexesAtom = atom<Sex[]>([]);

export const searchEntriesFilterAgesAtom = atom<AgeSimple[]>([]);

export const searchEntriesFilterBehaviorsAtom = atom<Behavior[]>([]);

export const searchEntriesFilterBreedersAtom = atom<NicheurCode[]>([]);

export const searchEntriesFilterEnvironmentsAtom = atom<Environment[]>([]);

export const searchEntriesFilterCommentAtom = atom<string | null>(null);

export const searchEntriesCriteriaAtom = atom((get) => {
  const observerIds = get(searchEntriesFilterObserversAtom).map(({ id }) => id);
  const fromDate = get(searchEntriesFilterFromDateAtom) ?? undefined;
  const toDate = get(searchEntriesFilterToDateAtom) ?? undefined;
  const departmentIds = get(searchEntriesFilterInternalDepartmentsAtom).map(({ id }) => id);
  const townIds = get(searchEntriesFilterTownsInternalAtom).map(({ id }) => id);
  const localityIds = get(searchEntriesFilterLocalitiesAtom).map(({ id }) => id);
  const classIds = get(searchEntriesFilterClassesAtom).map(({ id }) => id);
  const speciesIds = get(searchEntriesFilterSpeciesAtom).map(({ id }) => id);
  const sexIds = get(searchEntriesFilterSexesAtom).map(({ id }) => id);
  const ageIds = get(searchEntriesFilterAgesAtom).map(({ id }) => id);
  const behaviorIds = get(searchEntriesFilterBehaviorsAtom).map(({ id }) => id);
  const breeders = get(searchEntriesFilterBreedersAtom);
  const environmentIds = get(searchEntriesFilterEnvironmentsAtom).map(({ id }) => id);
  const comment = get(searchEntriesFilterCommentAtom) ?? undefined;

  return {
    observerIds,
    fromDate,
    toDate,
    departmentIds,
    townIds,
    localityIds,
    classIds,
    speciesIds,
    sexIds,
    ageIds,
    behaviorIds,
    breeders: breeders.length ? breeders : undefined,
    environmentIds,
    comment: comment?.length ? comment : undefined,
  } satisfies SearchCriteriaParams;
});
