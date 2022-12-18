import { z } from "zod";
import { type SortOrder } from "../common";

export const communeSchema = z.object({
  id: z.number(),
  departementId: z.number(),
  code: z.number(),
  nom: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Commune = z.infer<typeof communeSchema>;

export const communeWithDepartementCodeSchema = communeSchema.extend({
  departementCode: z.string(),
});

export type CommuneWithDepartementCode = z.infer<typeof communeWithDepartementCodeSchema>;

export type CommuneFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "code" | "nom" | "departement" | "nbDonnees" | "nbLieuxDits" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type CommuneCreateInput = {
  departement_id: number;
  code: number;
  nom: string;
  owner_id?: string | null;
};
