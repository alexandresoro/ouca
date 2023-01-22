import { z } from "zod";
import { type SortOrder } from "../common.js";

export const departementSchema = z.object({
  id: z.number(),
  code: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Departement = z.infer<typeof departementSchema>;

export type DepartementFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "code" | "nbDonnees" | "nbCommunes" | "nbLieuxDits" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type DepartementCreateInput = {
  code: string;
  owner_id?: string | null;
};
