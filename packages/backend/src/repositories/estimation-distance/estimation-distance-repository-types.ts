import { z } from "zod";
import { type SortOrder } from "../common.js";

export const estimationDistanceSchema = z.object({
  id: z.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type EstimationDistance = z.infer<typeof estimationDistanceSchema>;

export type EstimationDistanceFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "libelle" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type EstimationDistanceCreateInput = {
  libelle: string;
  owner_id?: string | null;
};
