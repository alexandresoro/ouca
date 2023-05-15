import { z } from "zod";
import { townSchema } from "../entities/town.js";

/**
 * `GET` `/town/:id`
 *  Retrieve town entity
 */
export const getTownResponse = townSchema.omit({ editable: true });

export type GetTownResponse = z.infer<typeof getTownResponse>;

/**
 * `PUT` `/town/:id` Update of town entity
 * `POST` `/town` Create new town entity
 */
export const upsertTownInput = z.object({
  code: z.coerce.number(),
  nom: z.string().trim().min(1),
  departmentId: z.string().trim().min(1),
});

export type UpsertTownInput = z.infer<typeof upsertTownInput>;

export const upsertTownResponse = townSchema.omit({ editable: true });

export type UpsertTownResponse = z.infer<typeof upsertTownResponse>;
