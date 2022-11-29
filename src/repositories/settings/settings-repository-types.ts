import { z } from "zod";
import { COORDINATES_SYSTEMS } from "../../model/coordinates-system/coordinates-system.object";

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
