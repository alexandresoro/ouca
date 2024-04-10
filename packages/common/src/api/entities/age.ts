import { z } from "zod";

/**
 * @deprecated Use `ageSimpleSchema` instead.
 */
export const ageExtendedSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
  entriesCount: z.number(),
});

export type AgeExtended = z.infer<typeof ageExtendedSchema>;

export const ageSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Age = z.infer<typeof ageSchema>;
