import { z } from "zod";

export const speciesClassSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
});

export type SpeciesClass = z.infer<typeof speciesClassSchema>;
