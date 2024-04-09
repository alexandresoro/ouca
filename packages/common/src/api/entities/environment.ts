import { z } from "zod";

export const environmentSchema = z.object({
  id: z.coerce.string(),
  code: z.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
});

export type Environment = z.infer<typeof environmentSchema>;

/**
 * @deprecated Use `environmentSchema` instead.
 */
export const environmentExtendedSchema = environmentSchema.extend({
  entriesCount: z.number(),
});

/**
 * @deprecated Use `Environment` instead.
 */
export type EnvironmentExtended = z.infer<typeof environmentExtendedSchema>;
