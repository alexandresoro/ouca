import { z } from "zod";
import { COORDINATES_SYSTEMS } from "../coordinates-system/coordinates-system.object.js";

/**
 * `GET` `/settings`
 */
export const getSettingsResponse = z.object({
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
});

export type GetSettingsResponse = z.infer<typeof getSettingsResponse>;
