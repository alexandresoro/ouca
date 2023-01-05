import { z } from "zod";
import { type SortOrder } from "../common";

export const observateurSchema = z.object({
  id: z.number(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Observateur = z.infer<typeof observateurSchema>;

export type ObservateurFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "libelle" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type ObservateurCreateInput = {
  libelle: string;
  owner_id?: string | null;
};
