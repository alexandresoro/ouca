import { speciesSchema } from "@domain/species/species.js";
import { z } from "zod";

export const especeWithClasseLibelleSchema = speciesSchema.extend({
  classeLibelle: z.string(),
});

export type EspeceWithClasseLibelle = z.infer<typeof especeWithClasseLibelleSchema>;

export type EspeceCreateInput = {
  classe_id: number;
  code: string;
  nom_francais: string;
  nom_latin: string;
  owner_id?: string | null;
};
