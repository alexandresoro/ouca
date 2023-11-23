import { z } from "zod";
import { paginationQueryParamsSchema } from "./pagination.js";

export const ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS = ["id", "libelle", "nbDonnees"] as const;

export type EntitiesWithLabelOrderBy = typeof ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS[number];

const sortOrder = ["asc", "desc"] as const;

export type SortOrder = typeof sortOrder[number];

export const entitiesCommonQueryParamsSchema = paginationQueryParamsSchema.extend({
  q: z.string().optional(),
  sortOrder: z.enum(sortOrder).optional(),
  // Deprecated, extended will only be available for a single entity
  extended: z.coerce.boolean().default(false),
});

export const entityExtendedSearchParamSchema = z.object({
  extended: z.coerce.boolean().default(false),
});
