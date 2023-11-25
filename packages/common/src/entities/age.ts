import { z } from "zod";

export const ageSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  editable: z.boolean(),
  entriesCount: z.number(),
});

export type Age = z.infer<typeof ageSchema>;

export const ageSimpleSchema = ageSchema.omit({
  entriesCount: true,
});

export type AgeSimple = z.infer<typeof ageSimpleSchema>;
