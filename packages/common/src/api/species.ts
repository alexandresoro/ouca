import { z } from "zod";
import { entitiesCommonQueryParamsSchema } from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";
import { getSearchCriteriaParamsSchema } from "./common/search-criteria.js";
import { speciesSchema } from "./entities/species.js";

/**
 * `GET` `/species/:id`
 *  Retrieve species entity
 */
export const getSpeciesResponse = speciesSchema;

export type GetSpeciesResponse = z.infer<typeof getSpeciesResponse>;

/**
 * `GET` `/species/:id/info`
 *  Retrieve species info
 */
export const speciesInfoSchema = entityInfoSchema.extend({
  totalEntriesCount: z.number().optional(),
});

/**
 * `GET` `/species`
 *  Retrieve paginated species results
 */
export const SPECIES_ORDER_BY_ELEMENTS = ["id", "code", "nomFrancais", "nomLatin", "nomClasse", "nbDonnees"] as const;
export type SpeciesOrderBy = (typeof SPECIES_ORDER_BY_ELEMENTS)[number];

export const getSpeciesQueryParamsSchema = entitiesCommonQueryParamsSchema
  .extend({
    orderBy: z.enum(SPECIES_ORDER_BY_ELEMENTS).optional(),
  })
  .merge(getSearchCriteriaParamsSchema);

export type SpeciesSearchParams = z.infer<typeof getSpeciesQueryParamsSchema>;

export const getSpeciesPaginatedResponse = getPaginatedResponseSchema(speciesSchema);

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
