import { z } from "zod";
import { speciesSchema } from "../entities/species.js";

/**
 * `GET` `/species/:id`
 *  Retrieve species entity
 */
export const getSpeciesResponse = speciesSchema.omit({ editable: true });

export type GetSpeciesResponse = z.infer<typeof getSpeciesResponse>;

/**
 * `PUT` `/species/:id` Update of species entity
 * `POST` `/species` Create new species entity
 */
export const upsertSpeciesInput = z.object({
  classeId: z.number(),
  code: z.string(),
  nomFrancais: z.string(),
  nomLatin: z.string(),
});

export type UpsertSpeciesInput = z.infer<typeof upsertSpeciesInput>;

export const upsertSpeciesResponse = speciesSchema.omit({ editable: true });

export type UpsertSpeciesResponse = z.infer<typeof upsertSpeciesResponse>;
