import { z } from "zod";

export const sexeSchema = z.object({
  id: z.number(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Sexe = z.infer<typeof sexeSchema>;
