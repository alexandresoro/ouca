import { z } from "zod";
import { ageSchema } from "../entities/age.js";

/**
 * `GET` `/age/:id`
 *  Retrieve age entity
 */
export const getAgeResponse = ageSchema.omit({ editable: true });

export type GetAgeResponse = z.infer<typeof getAgeResponse>;

/**
 * `PUT` `/age/:id` Update of age entity
 * `POST` `/age` Create new age entity
 */
export const upsertAgeInput = z.object({
  libelle: z.string(),
});

export type UpsertAgeInput = z.infer<typeof upsertAgeInput>;

export const upsertAgeResponse = ageSchema.omit({ editable: true });

export type UpsertAgeResponse = z.infer<typeof upsertAgeResponse>;
