import { z } from "zod";
import { behaviorSchema } from "../entities/behavior.js";
import { NICHEUR_CODES } from "../types/nicheur.model.js";

/**
 * `GET` `/behavior/:id`
 *  Retrieve behavior entity
 */
export const getBehaviorResponse = behaviorSchema.omit({ editable: true });

export type GetBehaviorResponse = z.infer<typeof getBehaviorResponse>;

/**
 * `PUT` `/behavior/:id` Update of behavior entity
 * `POST` `/behavior` Create new behavior entity
 */
export const upsertBehaviorInput = z.object({
  code: z.string(),
  libelle: z.string(),
  nicheur: z.enum(NICHEUR_CODES).nullable(),
});

export type UpsertBehaviorInput = z.infer<typeof upsertBehaviorInput>;

export const upsertBehaviorResponse = behaviorSchema.omit({ editable: true });

export type UpsertBehaviorResponse = z.infer<typeof upsertBehaviorResponse>;
