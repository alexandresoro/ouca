import { CoordinatesSystemType } from "ouca-common/coordinates-system";

export interface SettingsDb {
  id: number;
  user_id?: number;
  default_observateur_id: number;
  default_departement_id: number;
  default_age_id: number;
  default_sexe_id: number;
  default_estimation_nombre_id: number;
  default_nombre: number;
  are_associes_displayed: boolean;
  is_meteo_displayed: boolean;
  is_distance_displayed: boolean;
  is_regroupement_displayed: boolean;
  coordinates_system: CoordinatesSystemType;
}
