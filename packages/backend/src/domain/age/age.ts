import { type SortOrder } from "@domain/shared/sort-order.js";
import { z } from "zod";

export const ageSchema = z.object({
  id: z.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Age = z.infer<typeof ageSchema>;

export type AgeFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "libelle" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type AgeCreateInput = {
  libelle: string;
  owner_id?: string | null;
};