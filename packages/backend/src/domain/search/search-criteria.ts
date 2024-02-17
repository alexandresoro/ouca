import { type BreederCode } from "../behavior/breeder.js";

// FIXME: use string instead of number for ids
export type SearchCriteria = {
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
