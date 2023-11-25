import { z } from "zod";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
  entityExtendedSearchParamSchema,
} from "./common/entitiesSearchParams.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";
import { observerSchema, observerSimpleSchema } from "./entities/observer.js";

/**
 * `GET` `/observer/:id`
 *  Retrieve observer entity
 */
export const getObserverQueryParamsSchema = entityExtendedSearchParamSchema;

export const getObserverResponse = observerSimpleSchema;

export type GetObserverResponse = z.infer<typeof getObserverResponse>;

export const getObserverExtendedResponse = observerSchema;

export type GetObserverExtendedResponse = z.infer<typeof getObserverExtendedResponse>;

/**
 * `GET` `/observers`
 *  Retrieve paginated observers results
 */
export const getObserversQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS).optional(),
});

export type ObserversSearchParams = Omit<z.infer<typeof getObserversQueryParamsSchema>, "extended">;

export const getObserversResponse = getPaginatedResponseSchema(observerSimpleSchema);

/**
 * @deprecated use `getObserversResponse` instead
 */
export const getObserversExtendedResponse = getPaginatedResponseSchema(observerSchema);

/**
 * `PUT` `/observer/:id` Update of observer entity
 * `POST` `/observer` Create new observer entity
 */
export const upsertObserverInput = z.object({
  libelle: z.string().trim().min(1),
});

export type UpsertObserverInput = z.infer<typeof upsertObserverInput>;

export const upsertObserverResponse = observerSimpleSchema;

export type UpsertObserverResponse = z.infer<typeof upsertObserverResponse>;
