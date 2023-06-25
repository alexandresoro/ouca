import { z } from "zod";
import { behaviorExtendedSchema, behaviorSchema } from "../entities/behavior.js";
import { NICHEUR_CODES } from "../types/nicheur.model.js";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";

/**
 * `GET` `/behavior/:id`
 *  Retrieve behavior entity
 */
export const getBehaviorResponse = behaviorSchema;

export type GetBehaviorResponse = z.infer<typeof getBehaviorResponse>;

/**
 * `GET` `/behaviors`
 *  Retrieve paginated behaviors results
 */
export const BEHAVIORS_ORDER_BY_ELEMENTS = [...ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS, "code", "nicheur"] as const;
export type BehaviorsOrderBy = typeof BEHAVIORS_ORDER_BY_ELEMENTS[number];

export const getBehaviorsQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(BEHAVIORS_ORDER_BY_ELEMENTS).optional(),
});

export type BehaviorsSearchParams = Omit<z.infer<typeof getBehaviorsQueryParamsSchema>, "extended">;

export const getBehaviorsResponse = getPaginatedResponseSchema(behaviorSchema);

export const getBehaviorsExtendedResponse = getPaginatedResponseSchema(behaviorExtendedSchema);

/**
 * `PUT` `/behavior/:id` Update of behavior entity
 * `POST` `/behavior` Create new behavior entity
 */
export const upsertBehaviorInput = z.object({
  code: z.string().trim().min(1),
  libelle: z.string().trim().min(1),
  nicheur: z.enum(NICHEUR_CODES).nullable(),
});

export type UpsertBehaviorInput = z.infer<typeof upsertBehaviorInput>;

export const upsertBehaviorResponse = behaviorSchema;

export type UpsertBehaviorResponse = z.infer<typeof upsertBehaviorResponse>;
