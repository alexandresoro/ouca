import { z } from "zod";
import { type SortOrder } from "../common";

export const meteoSchema = z.object({
  id: z.number(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Meteo = z.infer<typeof meteoSchema>;

export type MeteoFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "libelle" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type MeteoCreateInput = {
  libelle: string;
  owner_id?: string | null;
};
