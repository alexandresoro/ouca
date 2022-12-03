import { z } from "zod";

export const observateurSchema = z.object({
  id: z.number(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Observateur = z.infer<typeof observateurSchema>;
