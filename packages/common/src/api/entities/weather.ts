import { z } from "zod";

export const weatherSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
});

export type Weather = z.infer<typeof weatherSchema>;

/**
 * @deprecated Use `weatherSchema` instead.
 */
export const weatherExtendedSchema = weatherSchema.extend({
  entriesCount: z.number(),
});

/**
 * @deprecated Use `Weather` instead.
 */
export type WeatherExtended = z.infer<typeof weatherExtendedSchema>;
