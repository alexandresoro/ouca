import { z } from "zod";
import { sexSchema } from "../entities/sex.js";

/**
 * `GET` `/sex/:id`
 *  Retrieve sex entity
 */
export const getSexResponse = sexSchema.omit({ editable: true });

export type GetSexResponse = z.infer<typeof getSexResponse>;

/**
 * `PUT` `/sex/:id` Update of sex entity
 * `POST` `/sex` Create new sex entity
 */
export const upsertSexInput = z.object({
  libelle: z.string(),
});

export type UpsertSexInput = z.infer<typeof upsertSexInput>;

export const upsertSexResponse = sexSchema.omit({ editable: true });

export type UpsertSexResponse = z.infer<typeof upsertSexResponse>;
