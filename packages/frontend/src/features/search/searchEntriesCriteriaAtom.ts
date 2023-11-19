import { type SearchCriteriaParams } from "@ou-ca/common/api/common/search-criteria";
import { type Age } from "@ou-ca/common/entities/age";
import { type Behavior } from "@ou-ca/common/entities/behavior";
import { type Department } from "@ou-ca/common/entities/department";
import { type Environment } from "@ou-ca/common/entities/environment";
import { type Locality } from "@ou-ca/common/entities/locality";
import { type Observer } from "@ou-ca/common/entities/observer";
import { type Sex } from "@ou-ca/common/entities/sex";
import { type Species } from "@ou-ca/common/entities/species";
import { type SpeciesClass } from "@ou-ca/common/entities/species-class";
import { type Town } from "@ou-ca/common/entities/town";
import { type NicheurCode } from "@ou-ca/common/types/nicheur.model";
import { atom } from "jotai";

export const searchEntriesFilterObserversAtom = atom<Observer[]>([]);

export const searchEntriesFilterFromDateAtom = atom<string | null>(null);

export const searchEntriesFilterToDateAtom = atom<string | null>(null);

export const searchEntriesFilterDepartmentsAtom = atom<Department[]>([]);

export const searchEntriesFilterTownsAtom = atom<Town[]>([]);

export const searchEntriesFilterLocalitiesAtom = atom<Locality[]>([]);

export const searchEntriesFilterClassesAtom = atom<SpeciesClass[]>([]);

export const searchEntriesFilterSpeciesAtom = atom<Species[]>([]);

export const searchEntriesFilterSexesAtom = atom<Sex[]>([]);

export const searchEntriesFilterAgesAtom = atom<Age[]>([]);

export const searchEntriesFilterBehaviorsAtom = atom<Behavior[]>([]);

export const searchEntriesFilterBreedersAtom = atom<NicheurCode[]>([]);

export const searchEntriesFilterEnvironmentsAtom = atom<Environment[]>([]);

export const searchEntriesFilterCommentAtom = atom<string | null>(null);

export const searchEntriesCriteriaAtom = atom((get) => {
  const observerIds = get(searchEntriesFilterObserversAtom).map(({ id }) => id);
  const fromDate = get(searchEntriesFilterFromDateAtom) ?? undefined;
  const toDate = get(searchEntriesFilterToDateAtom) ?? undefined;
  const departmentIds = get(searchEntriesFilterDepartmentsAtom).map(({ id }) => id);
  const townIds = get(searchEntriesFilterTownsAtom).map(({ id }) => id);
  const localityIds = get(searchEntriesFilterLocalitiesAtom).map(({ id }) => id);
  const classIds = get(searchEntriesFilterClassesAtom).map(({ id }) => id);
  const sexIds = get(searchEntriesFilterSexesAtom).map(({ id }) => id);
  const ageIds = get(searchEntriesFilterAgesAtom).map(({ id }) => id);
  const speciesIds = get(searchEntriesFilterSpeciesAtom).map(({ id }) => id);
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
    sexIds,
    ageIds,
    speciesIds,
    behaviorIds,
    breeders: breeders.length ? breeders : undefined,
    environmentIds,
    comment: comment?.length ? comment : undefined,
  } satisfies SearchCriteriaParams;
});
