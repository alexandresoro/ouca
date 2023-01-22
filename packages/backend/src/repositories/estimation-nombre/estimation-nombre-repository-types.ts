import { z } from "zod";
import { type SortOrder } from "../common.js";

export const estimationNombreSchema = z.object({
  id: z.number(),
  libelle: z.string(),
  nonCompte: z.boolean(),
  ownerId: z.string().uuid().nullable(),
});

export type EstimationNombre = z.infer<typeof estimationNombreSchema>;

export type EstimationNombreFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "libelle" | "non_compte" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type EstimationNombreCreateInput = {
  libelle: string;
  non_compte: boolean;
  owner_id?: string | null;
};
