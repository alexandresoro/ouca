import { z } from "zod";

export const sexSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
});

export type Sex = z.infer<typeof sexSchema>;

/**
 * @deprecated Use `sexSchema` instead.
 */
export const sexExtendedSchema = sexSchema.extend({
  entriesCount: z.number(),
});

/**
 * @deprecated Use `Sex` instead.
 */
export type SexExtended = z.infer<typeof sexExtendedSchema>;
