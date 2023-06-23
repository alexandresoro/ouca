import { z } from "zod";
import { paginationQueryParamsSchema } from "./pagination.js";

export const ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS = ["id", "libelle", "nbDonnees"] as const;

export type EntitiesWithLabelOrderBy = typeof ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS[number];

export const entitiesCommonQueryParamsSchema = paginationQueryParamsSchema.extend({
  q: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  extended: z.coerce.boolean().default(false),
});
