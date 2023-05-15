import { z } from "zod";
import { distanceEstimateSchema } from "../entities/distance-estimate.js";

/**
 * `GET` `/distance-estimate/:id`
 *  Retrieve distance estimate entity
 */
export const getDistanceEstimateResponse = distanceEstimateSchema.omit({ editable: true });

export type GetDistanceEstimateResponse = z.infer<typeof getDistanceEstimateResponse>;

/**
 * `PUT` `/distance-estimate/:id` Update of distance estimate entity
 * `POST` `/distance-estimate` Create new distance estimate entity
 */
export const upsertDistanceEstimateInput = z.object({
  libelle: z.string().trim().min(1),
});

export type UpsertDistanceEstimateInput = z.infer<typeof upsertDistanceEstimateInput>;

export const upsertDistanceEstimateResponse = distanceEstimateSchema.omit({ editable: true });

export type UpsertDistanceEstimateResponse = z.infer<typeof upsertDistanceEstimateResponse>;
