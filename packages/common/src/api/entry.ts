import { z } from "zod";

/**
 * `GET` `/entry/last`
 */
export const getEntryLastResponse = z.object({
  id: z.number().nullable(),
});

export type GetEntryLastResponse = z.infer<typeof getEntryLastResponse>;
