import { z } from "zod";

export const speciesClassSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  editable: z.boolean().optional(),
});

export type SpeciesClass = z.infer<typeof speciesClassSchema>;
