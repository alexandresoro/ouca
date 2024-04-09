import { z } from "zod";

export const townSchema = z.object({
  id: z.coerce.string(),
  code: z.number(),
  nom: z.string(),
  departmentId: z.string(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
});

export type Town = z.infer<typeof townSchema>;

/**
 * @deprecated Use `townSchema` instead.
 */
export const townExtendedSchema = townSchema.extend({
  departmentCode: z.string(),
  localitiesCount: z.number(),
  entriesCount: z.number(),
});

/**
 * @deprecated Use `Town` instead.
 */
export type TownExtended = z.infer<typeof townExtendedSchema>;
