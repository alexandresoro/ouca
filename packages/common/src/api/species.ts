import { z } from "zod";
import { speciesExtendedSchema, speciesSchema } from "../entities/species.js";
import { entitiesCommonQueryParamsSchema } from "./common/entitiesSearchParams.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";

/**
 * `GET` `/species/:id`
 *  Retrieve species entity
 */
export const getSpeciesResponse = speciesSchema;

export type GetSpeciesResponse = z.infer<typeof getSpeciesResponse>;

/**
 * `GET` `/species`
 *  Retrieve paginated species results
 */
export const SPECIES_ORDER_BY_ELEMENTS = ["id", "code", "nomFrancais", "nomLatin", "nomClasse", "nbDonnees"] as const;
export type SpeciesOrderBy = typeof SPECIES_ORDER_BY_ELEMENTS[number];

export const getSpeciesQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(SPECIES_ORDER_BY_ELEMENTS).optional(),
});

export type SpeciesSearchParams = Omit<z.infer<typeof getSpeciesQueryParamsSchema>, "extended">;

export const getSpeciesPaginatedResponse = getPaginatedResponseSchema(speciesSchema);

export const getSpeciesExtendedResponse = getPaginatedResponseSchema(speciesExtendedSchema);

/**
 * `PUT` `/species/:id` Update of species entity
 * `POST` `/species` Create new species entity
 */
export const upsertSpeciesInput = z.object({
  classId: z.string().trim().min(1),
  code: z.string().trim().min(1),
  nomFrancais: z.string().trim().min(1),
  nomLatin: z.string().trim().min(1),
});

export type UpsertSpeciesInput = z.infer<typeof upsertSpeciesInput>;

export const upsertSpeciesResponse = speciesSchema;

export type UpsertSpeciesResponse = z.infer<typeof upsertSpeciesResponse>;
