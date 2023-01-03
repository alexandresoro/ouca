import { z } from "zod";
import { type SortOrder } from "../common";

export const classeSchema = z.object({
  id: z.number(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Classe = z.infer<typeof classeSchema>;

export type ClasseFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "libelle" | "nbEspeces" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type ClasseCreateInput = {
  libelle: string;
  owner_id?: string | null;
};
