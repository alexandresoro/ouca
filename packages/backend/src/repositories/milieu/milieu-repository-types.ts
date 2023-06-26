import { z } from "zod";
import { type SortOrder } from "../common.js";

export const milieuSchema = z.object({
  id: z.string(),
  code: z.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Milieu = z.infer<typeof milieuSchema>;

export type MilieuFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "code" | "libelle" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type MilieuCreateInput = {
  code: string;
  libelle: string;
  owner_id?: string | null;
};
