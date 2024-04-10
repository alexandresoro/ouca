import { z } from "zod";

export const distanceEstimateSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
});

export type DistanceEstimate = z.infer<typeof distanceEstimateSchema>;
