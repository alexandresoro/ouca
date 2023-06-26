import { type CoordinatesSystemType } from "@ou-ca/common/coordinates-system/coordinates-system.object";
import { z } from "zod";
import { type SortOrder } from "../common.js";

export const lieuditSchema = z.object({
  id: z.string(),
  townId: z.string(),
  nom: z.string(),
  altitude: z.number(),
  longitude: z.number(),
  latitude: z.number(),
  ownerId: z.string().uuid().nullable(),
});

export type Lieudit = z.infer<typeof lieuditSchema>;

export const lieuditWithCommuneAndDepartementCodeSchema = lieuditSchema.extend({
  communeCode: z.number(),
  communeNom: z.string(),
  departementCode: z.string(),
});

export type LieuditWithCommuneAndDepartementCode = z.infer<typeof lieuditWithCommuneAndDepartementCodeSchema>;

export type LieuditFindManyInput = Partial<{
  q: string | null;
  townId?: number | null;
  orderBy:
    | "id"
    | "nom"
    | "altitude"
    | "latitude"
    | "longitude"
    | "codeCommune"
    | "nomCommune"
    | "departement"
    | "nbDonnees"
    | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type LieuditCreateInput = {
  commune_id: number;
  nom: string;
  altitude: number;
  latitude: number;
  longitude: number;
  coordinates_system: CoordinatesSystemType;
  owner_id?: string | null;
};
