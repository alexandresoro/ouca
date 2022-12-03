import { z } from "zod";
import { NICHEUR_CODES } from "../../model/types/nicheur.model";

export const comportementSchema = z.object({
  id: z.number(),
  code: z.string(),
  libelle: z.string(),
  nicheur: z.enum(NICHEUR_CODES).nullable(),
  ownerId: z.string().uuid().nullable(),
});

export type Comportement = z.infer<typeof comportementSchema>;
