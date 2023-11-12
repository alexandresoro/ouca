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
