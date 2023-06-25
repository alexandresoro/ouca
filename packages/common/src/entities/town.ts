import { z } from "zod";

export const townSchema = z.object({
  id: z.coerce.string(),
  code: z.number(),
  nom: z.string(),
  departmentId: z.string(),
  editable: z.boolean().optional(),
});

export type Town = z.infer<typeof townSchema>;

export const townExtendedSchema = townSchema.extend({
  localitiesCount: z.number(),
  entriesCount: z.number(),
});

export type TownExtended = z.infer<typeof townExtendedSchema>;
