import { z } from "zod";

/**
 * @deprecated Use `ageSimpleSchema` instead.
 */
export const ageSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
  entriesCount: z.number(),
});

/**
 * @deprecated Use `AgeSimple` instead.
 */
export type Age = z.infer<typeof ageSchema>;

// TODO: rename this to ageSchema
export const ageSimpleSchema = ageSchema.omit({
  entriesCount: true,
});

// TODO: rename this to Age
export type AgeSimple = z.infer<typeof ageSimpleSchema>;
