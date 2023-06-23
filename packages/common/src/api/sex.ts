import { z } from "zod";
import { sexExtendedSchema, sexSchema } from "../entities/sex.js";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";

/**
 * `GET` `/sex/:id`
 *  Retrieve sex entity
 */
export const getSexResponse = sexSchema;

export type GetSexResponse = z.infer<typeof getSexResponse>;

/**
 * `GET` `/sexes`
 *  Retrieve paginated sexes results
 */
export const getSexesQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS).optional(),
});

export type SexesSearchParams = Omit<z.infer<typeof getSexesQueryParamsSchema>, "extended">;

export const getSexesResponse = getPaginatedResponseSchema(sexSchema);

export const getSexesExtendedResponse = getPaginatedResponseSchema(sexExtendedSchema);

/**
 * `PUT` `/sex/:id` Update of sex entity
 * `POST` `/sex` Create new sex entity
 */
export const upsertSexInput = z.object({
  libelle: z.string().trim().min(1),
});

export type UpsertSexInput = z.infer<typeof upsertSexInput>;

export const upsertSexResponse = sexSchema;

export type UpsertSexResponse = z.infer<typeof upsertSexResponse>;
