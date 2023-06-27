import { z } from "zod";
import { entryExtendedSchema, entryNavigationSchema, entrySchema } from "../entities/entry.js";
import { getPaginatedResponseSchema, paginationQueryParamsSchema } from "./common/pagination.js";
import { getSearchCriteriaParamsSchema } from "./common/search-criteria.js";

/**
 * `GET` `/entry/:id`
 *  Retrieve entry
 */
export const getEntryResponse = entrySchema;

export type GetEntryResponse = z.infer<typeof getEntryResponse>;

/**
 * `GET` `/entries`
 *  Retrieve paginated entries results
 */
export const ENTRIES_ORDER_BY_ELEMENTS = [
  "id",
  "codeEspece",
  "nomFrancais",
  "nombre",
  "sexe",
  "age",
  "departement",
  "codeCommune",
  "nomCommune",
  "lieuDit",
  "date",
  "heure",
  "duree",
  "observateur",
] as const;
export type EntriesOrderBy = typeof ENTRIES_ORDER_BY_ELEMENTS[number];

export const getEntriesQueryParamsSchema = paginationQueryParamsSchema
  .required()
  .extend({
    orderBy: z.enum(ENTRIES_ORDER_BY_ELEMENTS).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    extended: z.coerce.boolean().default(false),
  })
  .merge(getSearchCriteriaParamsSchema);

export type EntriesSearchParams = Omit<z.infer<typeof getEntriesQueryParamsSchema>, "extended">;

export const getEntriesResponse = getPaginatedResponseSchema(entrySchema);

export const getEntriesExtendedResponse = getPaginatedResponseSchema(entryExtendedSchema);

/**
 * `PUT` `/entry/:id` Update of entry
 * `POST` `/entry` Create new entry
 */
export const upsertEntryInput = z.object({
  inventoryId: z.number(),
  speciesId: z.number(),
  sexId: z.number(),
  ageId: z.number(),
  numberEstimateId: z.number(),
  number: z.number().nullable(),
  distanceEstimateId: z.number().nullable(),
  distance: z.number().nullable(),
  regroupment: z.number().nullable(),
  comment: z.string().nullable(),
  behaviorIds: z.array(z.number()),
  environmentIds: z.array(z.number()),
});

export type UpsertEntryInput = z.infer<typeof upsertEntryInput>;

export const upsertEntryResponse = entrySchema;

export type UpsertEntryResponse = z.infer<typeof upsertEntryResponse>;

/**
 * `GET` `/entry/:id/navigation` Get navigation relative to the given entry
 */
export const getEntryNavigationResponse = entryNavigationSchema;

export type GetEntryNavigationResponse = z.infer<typeof getEntryNavigationResponse>;

/**
 * `GET` `/entry/last`
 */
export const getEntryLastResponse = z.object({
  id: z.number().nullable(),
});

export type GetEntryLastResponse = z.infer<typeof getEntryLastResponse>;
