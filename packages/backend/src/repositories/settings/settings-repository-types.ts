import {
  COORDINATES_SYSTEMS,
  type CoordinatesSystemType,
} from "@ou-ca/common/coordinates-system/coordinates-system.object";
import { z } from "zod";

export const settingsSchema = z.object({
  id: z.number(),
  defaultObservateurId: z.number().nullable(),
  defaultDepartementId: z.number().nullable(),
  defaultAgeId: z.number().nullable(),
  defaultSexeId: z.number().nullable(),
  defaultEstimationNombreId: z.number().nullable(),
  defaultNombre: z.number().nullable(),
  areAssociesDisplayed: z.boolean(),
  isMeteoDisplayed: z.boolean(),
  isDistanceDisplayed: z.boolean(),
  isRegroupementDisplayed: z.boolean(),
  coordinatesSystem: z.enum(COORDINATES_SYSTEMS),
  userId: z.string().uuid(),
});

export type Settings = z.infer<typeof settingsSchema>;

export type UpdateSettingsInput = Partial<{
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
}>;
