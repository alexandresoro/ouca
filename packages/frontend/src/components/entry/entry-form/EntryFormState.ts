export type EntryFormState = {
  inventoryId: string | null;
  speciesId: string | null;
  sexId: string | null;
  ageId: string | null;
  numberEstimateId: string | null;
  number: number | null;
  distanceEstimateId: string | null;
  distance: number | null;
  regroupment: number | null;
  behaviorIds: string[];
  environmentIds: string[];
  comment: string | null;
};
