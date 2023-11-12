import { type Generated } from "kysely";

export type Settings = {
  id: Generated<number>;
  default_observateur_id: number | null;
  default_departement_id: number | null;
  default_age_id: number | null;
  default_sexe_id: number | null;
  default_estimation_nombre_id: number | null;
  default_nombre: number | null;
  are_associes_displayed: Generated<boolean>;
  is_meteo_displayed: Generated<boolean>;
  is_distance_displayed: Generated<boolean>;
  is_regroupement_displayed: Generated<boolean>;
  userId: string;
};
