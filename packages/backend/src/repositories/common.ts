import { z } from "zod";

const SORT_ORDER = ["asc", "desc", null] as const;

export type SortOrder = (typeof SORT_ORDER)[number];

export const countSchema = z.object({
  count: z.number(),
});
