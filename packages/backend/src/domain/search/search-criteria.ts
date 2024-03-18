import type { BreederCode } from "../behavior/breeder.js";

/**
 * @deprecated
 */
export type LegacySearchCriteria = {
  entryId?: number;
  inventoryId?: number;
  observerIds?: number[];
  temperature?: number | null;
  weatherIds?: number[];
  associateIds?: number[];
  time?: string;
  duration?: string;
  classIds?: number[];
  speciesIds?: number[];
  departmentIds?: number[];
  townIds?: number[];
  localityIds?: number[];
  number?: number;
  numberEstimateIds?: number[];
  sexIds?: number[];
  ageIds?: number[];
  distance?: number | null;
  distanceEstimateIds?: number[];
  regroupment?: number;
  fromDate?: string | null;
  toDate?: string | null;
  comment?: string;
  breeders?: BreederCode[];
  behaviorIds?: number[];
  environmentIds?: number[];
};

export type SearchCriteria = {
  entryId?: string;
  inventoryId?: string;
  observerIds?: string[];
  temperature?: number | null;
  weatherIds?: string[];
  associateIds?: string[];
  time?: string;
  duration?: string;
  classIds?: string[];
  speciesIds?: string[];
  departmentIds?: string[];
  townIds?: string[];
  localityIds?: string[];
  number?: number;
  numberEstimateIds?: string[];
  sexIds?: string[];
  ageIds?: string[];
  distance?: number | null;
  distanceEstimateIds?: string[];
  regroupment?: string;
  fromDate?: string | null;
  toDate?: string | null;
  comment?: string;
  breeders?: BreederCode[];
  behaviorIds?: string[];
  environmentIds?: string[];
};
