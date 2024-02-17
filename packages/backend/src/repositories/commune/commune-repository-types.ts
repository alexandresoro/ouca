import { townSchema } from "@domain/town/town.js";
import { z } from "zod";
import { type SortOrder } from "../common.js";

export type Commune = z.infer<typeof townSchema>;

export const communeWithDepartementCodeSchema = townSchema.extend({
  departementCode: z.string(),
});

export type CommuneWithDepartementCode = z.infer<typeof communeWithDepartementCodeSchema>;

export type CommuneFindManyInput = Partial<{
  q: string | null;
  departmentId?: number | null;
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
