import { z } from "zod";
import { environmentExtendedSchema, environmentSchema } from "../entities/environment.js";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";

/**
 * `GET` `/environment/:id`
 *  Retrieve environment entity
 */
export const getEnvironmentResponse = environmentSchema;

export type GetEnvironmentResponse = z.infer<typeof getEnvironmentResponse>;

/**
 * `GET` `/environments`
 *  Retrieve paginated environments results
 */
export const ENVIRONMENTS_ORDER_BY_ELEMENTS = [...ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS, "code"] as const;
export type EnvironmentsOrderBy = typeof ENVIRONMENTS_ORDER_BY_ELEMENTS[number];

export const getEnvironmentsQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(ENVIRONMENTS_ORDER_BY_ELEMENTS).optional(),
});

export type EnvironmentsSearchParams = Omit<z.infer<typeof getEnvironmentsQueryParamsSchema>, "extended">;

export const getEnvironmentsResponse = getPaginatedResponseSchema(environmentSchema);

export const getEnvironmentsExtendedResponse = getPaginatedResponseSchema(environmentExtendedSchema);

/**
 * `PUT` `/environment/:id` Update of environment entity
 * `POST` `/environment` Create new environment entity
 */
export const upsertEnvironmentInput = z.object({
  code: z.string().trim().min(1),
  libelle: z.string().trim().min(1),
});

export type UpsertEnvironmentInput = z.infer<typeof upsertEnvironmentInput>;

export const upsertEnvironmentResponse = environmentSchema;

export type UpsertEnvironmentResponse = z.infer<typeof upsertEnvironmentResponse>;
