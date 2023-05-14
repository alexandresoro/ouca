import { z } from "zod";

export const distanceEstimateSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  editable: z.boolean().optional(),
});

export type DistanceEstimate = z.infer<typeof distanceEstimateSchema>;