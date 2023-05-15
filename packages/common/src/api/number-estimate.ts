import { z } from "zod";
import { numberEstimateSchema } from "../entities/number-estimate.js";

/**
 * `GET` `/number-estimate/:id`
 *  Retrieve number estimate entity
 */
export const getNumberEstimateResponse = numberEstimateSchema.omit({ editable: true });

export type GetNumberEstimateResponse = z.infer<typeof getNumberEstimateResponse>;

/**
 * `PUT` `/number-estimate/:id` Update of number estimate entity
 * `POST` `/number-estimate` Create new number estimate entity
 */
export const upsertNumberEstimateInput = z.object({
  libelle: z.string().trim().min(1),
  nonCompte: z.boolean(),
});

export type UpsertNumberEstimateInput = z.infer<typeof upsertNumberEstimateInput>;

export const upsertNumberEstimateResponse = numberEstimateSchema.omit({ editable: true });

export type UpsertNumberEstimateResponse = z.infer<typeof upsertNumberEstimateResponse>;
