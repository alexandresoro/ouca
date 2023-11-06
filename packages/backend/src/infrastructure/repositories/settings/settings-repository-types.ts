import { z } from "zod";

export const settingsSchema = z.object({
  id: z.string(),
  defaultObservateurId: z.string().nullable(),
  defaultDepartementId: z.string().nullable(),
  defaultAgeId: z.string().nullable(),
  defaultSexeId: z.string().nullable(),
  defaultEstimationNombreId: z.string().nullable(),
  defaultNombre: z.number().nullable(),
  areAssociesDisplayed: z.boolean(),
  isMeteoDisplayed: z.boolean(),
  isDistanceDisplayed: z.boolean(),
  isRegroupementDisplayed: z.boolean(),
  userId: z.string().uuid(),
});

export type Settings = z.infer<typeof settingsSchema>;

export type UpdateSettingsInput = Partial<{
  default_observateur_id: number | null;
  default_departement_id: number | null;
  default_age_id: number | null;
  default_sexe_id: number | null;
  default_estimation_nombre_id: number | null;
  default_nombre: number | null;
  are_associes_displayed: boolean;
  is_meteo_displayed: boolean;
  is_distance_displayed: boolean;
  is_regroupement_displayed: boolean;
}>;
