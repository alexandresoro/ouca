import { z } from "zod";
import { type SortOrder } from "../common";

export const sexeSchema = z.object({
  id: z.number(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Sexe = z.infer<typeof sexeSchema>;

export type SexeFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "libelle" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type SexeCreateInput = {
  libelle: string;
  owner_id?: string | null;
};

export const sexeWithNbSpecimensSchema = sexeSchema.extend({
  nbSpecimens: z.number().nullable(),
});

export type SexeWithNbSpecimens = z.infer<typeof sexeWithNbSpecimensSchema>;
