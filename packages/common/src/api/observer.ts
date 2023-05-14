import { z } from "zod";
import { observerSchema } from "../entities/observer.js";

/**
 * `GET` `/observer/:id`
 *  Retrieve observer entity
 */
export const getObserverResponse = observerSchema.omit({ editable: true });

export type GetObserverResponse = z.infer<typeof getObserverResponse>;

/**
 * `PUT` `/observer/:id` Update of observer entity
 * `POST` `/observer` Create new observer entity
 */
export const upsertObserverInput = z.object({
  libelle: z.string(),
});

export type UpsertObserverInput = z.infer<typeof upsertObserverInput>;

export const upsertObserverResponse = observerSchema.omit({ editable: true });

export type UpsertObserverResponse = z.infer<typeof upsertObserverResponse>;
