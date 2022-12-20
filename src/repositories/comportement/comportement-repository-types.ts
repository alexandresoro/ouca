import { z } from "zod";
import { NICHEUR_CODES, type NicheurCode } from "../../model/types/nicheur.model";
import { type SortOrder } from "../common";

export const comportementSchema = z.object({
  id: z.number(),
  code: z.string(),
  libelle: z.string(),
  nicheur: z.enum(NICHEUR_CODES).nullable(),
  ownerId: z.string().uuid().nullable(),
});

export type Comportement = z.infer<typeof comportementSchema>;

export type ComportementFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "code" | "libelle" | "nicheur" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type ComportementCreateInput = {
  code: string;
  libelle: string;
  nicheur?: NicheurCode | null;
  owner_id?: string | null;
};
