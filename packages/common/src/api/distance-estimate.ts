import { z } from "zod";
import { distanceEstimateExtendedSchema, distanceEstimateSchema } from "../entities/distance-estimate.js";
import { ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS, entitiesCommonQueryParamsSchema } from "./common/entitiesSearchParams.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";

/**
 * `GET` `/distance-estimate/:id`
 *  Retrieve distance estimate entity
 */
export const getDistanceEstimateResponse = distanceEstimateSchema;

export type GetDistanceEstimateResponse = z.infer<typeof getDistanceEstimateResponse>;

/**
 * `GET` `/distance-estimates`
 *  Retrieve paginated distance estimates results
 */
export const getDistanceEstimatesQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS).optional(),
});

export type DistanceEstimatesSearchParams = Omit<z.infer<typeof getDistanceEstimatesQueryParamsSchema>, "extended">;

export const getDistanceEstimatesResponse = getPaginatedResponseSchema(distanceEstimateSchema);

export const getDistanceEstimatesExtendedResponse = getPaginatedResponseSchema(distanceEstimateExtendedSchema);

/**
 * `PUT` `/distance-estimate/:id` Update of distance estimate entity
 * `POST` `/distance-estimate` Create new distance estimate entity
 */
export const upsertDistanceEstimateInput = z.object({
  libelle: z.string().trim().min(1),
});

export type UpsertDistanceEstimateInput = z.infer<typeof upsertDistanceEstimateInput>;

export const upsertDistanceEstimateResponse = distanceEstimateSchema;

export type UpsertDistanceEstimateResponse = z.infer<typeof upsertDistanceEstimateResponse>;
