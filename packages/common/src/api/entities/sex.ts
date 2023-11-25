import { z } from "zod";

export const sexSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  editable: z.boolean(),
});

export type Sex = z.infer<typeof sexSchema>;

export const sexExtendedSchema = sexSchema.extend({
  entriesCount: z.number(),
});

export type SexExtended = z.infer<typeof sexExtendedSchema>;
