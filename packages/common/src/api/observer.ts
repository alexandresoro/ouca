import { z } from "zod";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";
import { observerSchema } from "./entities/observer.js";

/**
 * `GET` `/observer/:id`
 *  Retrieve observer entity
 */
export const getObserverResponse = observerSchema;

export type GetObserverResponse = z.infer<typeof getObserverResponse>;

/**
 * `GET` `/observer/:id/info`
 *  Retrieve observer info
 */
export const observerInfoSchema = z.object({
  canBeDeleted: z.boolean(),
  ownEntriesCount: z.number(),
});

/**
 * `GET` `/observers`
 *  Retrieve paginated observers results
 */
export const getObserversQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS).optional(),
});

export type ObserversSearchParams = Omit<z.infer<typeof getObserversQueryParamsSchema>, "extended">;

export const getObserversResponse = getPaginatedResponseSchema(observerSchema);

/**
 * `PUT` `/observer/:id` Update of observer entity
 * `POST` `/observer` Create new observer entity
 */
export const upsertObserverInput = z.object({
  libelle: z.string().trim().min(1),
});

export type UpsertObserverInput = z.infer<typeof upsertObserverInput>;

export const upsertObserverResponse = observerSchema;

export type UpsertObserverResponse = z.infer<typeof upsertObserverResponse>;

/**
 * `DELETE` `/observer/:id` Delete observer entity
 */
export const deleteObserverResponse = observerSchema;

export type DeleteObserverResponse = z.infer<typeof deleteObserverResponse>;
