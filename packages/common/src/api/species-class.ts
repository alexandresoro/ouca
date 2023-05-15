import { z } from "zod";
import { speciesClassSchema } from "../entities/species-class.js";

/**
 * `GET` `/class/:id`
 *  Retrieve class entity
 */
export const getClassResponse = speciesClassSchema.omit({ editable: true });

export type GetClassResponse = z.infer<typeof getClassResponse>;

/**
 * `PUT` `/class/:id` Update of class entity
 * `POST` `/class` Create new class entity
 */
export const upsertClassInput = z.object({
  libelle: z.string().trim().min(1),
});

export type UpsertClassInput = z.infer<typeof upsertClassInput>;

export const upsertClassResponse = speciesClassSchema.omit({ editable: true });

export type UpsertClassResponse = z.infer<typeof upsertClassResponse>;
