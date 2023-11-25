import { z } from "zod";

export const speciesClassSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  editable: z.boolean(),
});

export type SpeciesClass = z.infer<typeof speciesClassSchema>;

export const speciesClassExtendedSchema = speciesClassSchema.extend({
  speciesCount: z.number(),
  entriesCount: z.number(),
});

export type SpeciesClassExtended = z.infer<typeof speciesClassExtendedSchema>;
