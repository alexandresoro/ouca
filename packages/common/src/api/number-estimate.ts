import { z } from "zod";
import { numberEstimateExtendedSchema, numberEstimateSchema } from "../entities/number-estimate.js";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";

/**
 * `GET` `/number-estimate/:id`
 *  Retrieve number estimate entity
 */
export const getNumberEstimateResponse = numberEstimateSchema;

export type GetNumberEstimateResponse = z.infer<typeof getNumberEstimateResponse>;

/**
 * `GET` `/number-estimates`
 *  Retrieve paginated number estimates results
 */
export const NUMBER_ESTIMATES_ORDER_BY_ELEMENTS = [...ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS, "nonCompte"] as const;
export type NumberEstimatesOrderBy = typeof NUMBER_ESTIMATES_ORDER_BY_ELEMENTS[number];

export const getNumberEstimatesQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(NUMBER_ESTIMATES_ORDER_BY_ELEMENTS).optional(),
});

export type NumberEstimatesSearchParams = Omit<z.infer<typeof getNumberEstimatesQueryParamsSchema>, "extended">;

export const getNumberEstimatesResponse = getPaginatedResponseSchema(numberEstimateSchema);

export const getNumberEstimatesExtendedResponse = getPaginatedResponseSchema(numberEstimateExtendedSchema);

/**
 * `PUT` `/number-estimate/:id` Update of number estimate entity
 * `POST` `/number-estimate` Create new number estimate entity
 */
export const upsertNumberEstimateInput = z.object({
  libelle: z.string().trim().min(1),
  nonCompte: z.boolean(),
});

export type UpsertNumberEstimateInput = z.infer<typeof upsertNumberEstimateInput>;

export const upsertNumberEstimateResponse = numberEstimateSchema;

export type UpsertNumberEstimateResponse = z.infer<typeof upsertNumberEstimateResponse>;
