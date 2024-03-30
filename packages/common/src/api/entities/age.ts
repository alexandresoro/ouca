import { z } from "zod";

export const ageSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
  entriesCount: z.number(),
});

export type Age = z.infer<typeof ageSchema>;

export const ageSimpleSchema = ageSchema.omit({
  entriesCount: true,
});

export type AgeSimple = z.infer<typeof ageSimpleSchema>;
