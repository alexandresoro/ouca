import { z } from "zod";

export const ageSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  editable: z.boolean(),
});

export type Age = z.infer<typeof ageSchema>;

export const ageExtendedSchema = ageSchema.extend({
  entriesCount: z.number(),
});

export type AgeExtended = z.infer<typeof ageExtendedSchema>;
