import { type Generated } from "kysely";

export type Settings = {
  id: Generated<number>;
  defaultObservateurId: number | null;
  defaultDepartementId: number | null;
  defaultAgeId: number | null;
  defaultSexeId: number | null;
  defaultEstimationNombreId: number | null;
  defaultNombre: number | null;
  areAssociesDisplayed: Generated<boolean>;
  isMeteoDisplayed: Generated<boolean>;
  isDistanceDisplayed: Generated<boolean>;
  isRegroupementDisplayed: Generated<boolean>;
  userId: string;
};
