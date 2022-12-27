import { z } from "zod";
import { type SortOrder } from "../common";

export const ageSchema = z.object({
  id: z.number(),
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

export const ageWithNbSpecimensSchema = ageSchema.extend({
  nbSpecimens: z.number().nullable(),
});

export type AgeWithNbSpecimens = z.infer<typeof ageWithNbSpecimensSchema>;
