import { z } from "zod";

export const distanceEstimateSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
});

export type DistanceEstimate = z.infer<typeof distanceEstimateSchema>;

/**
 * @deprecated Use `distanceEstimateSchema` instead.
 */
export const distanceEstimateExtendedSchema = distanceEstimateSchema.extend({
  entriesCount: z.number(),
});

/**
 * @deprecated Use `DistanceEstimate` instead.
 */
export type DistanceEstimateExtended = z.infer<typeof distanceEstimateExtendedSchema>;
