import { z } from "zod";

export const distanceEstimateSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  editable: z.boolean(),
});

export type DistanceEstimate = z.infer<typeof distanceEstimateSchema>;

export const distanceEstimateExtendedSchema = distanceEstimateSchema.extend({
  entriesCount: z.number(),
});

export type DistanceEstimateExtended = z.infer<typeof distanceEstimateExtendedSchema>;
