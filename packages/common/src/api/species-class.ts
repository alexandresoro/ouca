import { z } from "zod";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";
import { speciesClassSchema } from "./entities/species-class.js";

/**
 * `GET` `/class/:id`
 *  Retrieve class entity
 */
export const getClassResponse = speciesClassSchema;

export type GetClassResponse = z.infer<typeof getClassResponse>;

/**
 * `GET` `/classes/:id/info`
 *  Retrieve species class info
 */
export const speciesClassInfoSchema = entityInfoSchema.extend({
  speciesCount: z.number(),
});

/**
 * `GET` `/classes`
 *  Retrieve paginated classes results
 */
export const CLASSES_ORDER_BY_ELEMENTS = [...ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS, "nbEspeces"] as const;
export type ClassesOrderBy = (typeof CLASSES_ORDER_BY_ELEMENTS)[number];

export const getClassesQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(CLASSES_ORDER_BY_ELEMENTS).optional(),
});

export type ClassesSearchParams = z.infer<typeof getClassesQueryParamsSchema>;

export const getClassesResponse = getPaginatedResponseSchema(speciesClassSchema);

/**
 * `PUT` `/class/:id` Update of class entity
 * `POST` `/class` Create new class entity
 */
export const upsertClassInput = z.object({
  libelle: z.string().trim().min(1),
});

export type UpsertClassInput = z.infer<typeof upsertClassInput>;

export const upsertClassResponse = speciesClassSchema;

export type UpsertClassResponse = z.infer<typeof upsertClassResponse>;
