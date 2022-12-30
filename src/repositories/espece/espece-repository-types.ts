import { z } from "zod";
import { type SortOrder } from "../common";
import { type SearchCriteria } from "../search-criteria";

export const especeSchema = z.object({
  id: z.number(),
  classeId: z.number().nullable(),
  code: z.string(),
  nomFrancais: z.string(),
  nomLatin: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Espece = z.infer<typeof especeSchema>;

export const especeWithClasseLibelleSchema = especeSchema.extend({
  classeLibelle: z.string(),
});

export type EspeceWithClasseLibelle = z.infer<typeof especeWithClasseLibelleSchema>;

export type EspeceFindManyInput = Partial<{
  q: string | null | undefined;
  searchCriteria: SearchCriteria | null | undefined;
  orderBy: "id" | "code" | "nomClasse" | "nomFrancais" | "nomLatin" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type EspeceCreateInput = {
  classe_id: number;
  code: string;
  nom_francais: string;
  nom_latin: string;
  owner_id?: string | null;
};
